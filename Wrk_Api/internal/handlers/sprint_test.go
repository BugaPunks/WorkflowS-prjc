package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"Wrk_Api/internal/database"
	"Wrk_Api/internal/handlers"
	"Wrk_Api/internal/middleware"
	"Wrk_Api/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupSprintRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
		}

		projects := api.Group("/projects")
		projects.Use(middleware.AuthMiddleware())
		{
			projects.POST("/", handlers.CreateProject)

			sprints := projects.Group("/:projectId/sprints")
			{
				sprints.POST("/", handlers.CreateSprint)
				sprints.GET("/", handlers.GetSprints)
				sprints.GET("/:sprintId", handlers.GetSprint)
				sprints.PUT("/:sprintId", handlers.UpdateSprint)
				sprints.DELETE("/:sprintId", handlers.DeleteSprint)
			}
		}
	}
	return r
}

func setupSprintTestDB() {
	var err error
	database.DB, err = gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	database.DB.AutoMigrate(
		&models.User{},
		&models.Project{},
		&models.ProjectMember{},
		&models.Sprint{},
	)
}

// Reimplementing helper locally for this test file as test files in same package don't share symbols if run individually via go test file.go
// However, typically `go test ./package` shares them.
// Since we are running `go test -v ./internal/handlers/sprint_test.go`, we need to include other files or duplicate.
// It's better to run `go test -v ./internal/handlers` but that runs all tests.
// I will duplicate for isolation in this specific file execution context or rename the helper to be exported if it was in a common testutils package.
// For now, I'll copy it here.

func getAuthTokenForSprint(r *gin.Engine, email, name string) string {
	registerReq := handlers.RegisterRequest{
		Email:    email,
		Name:     name,
		Password: "password123",
	}
	jsonValue, _ := json.Marshal(registerReq)
	req, _ := http.NewRequest("POST", "/api/auth/register", bytes.NewBuffer(jsonValue))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var response handlers.AuthResponse
	json.Unmarshal(w.Body.Bytes(), &response)
	return response.Token
}

func createProjectForSprintTest(r *gin.Engine, token string) string {
	projectReq := handlers.CreateProjectRequest{
		Name: "Sprint Project",
	}
	jsonValue, _ := json.Marshal(projectReq)
	req, _ := http.NewRequest("POST", "/api/projects/", bytes.NewBuffer(jsonValue))
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var project models.Project
	json.Unmarshal(w.Body.Bytes(), &project)
	return project.ID
}

func TestCreateSprint(t *testing.T) {
	setupSprintTestDB()
	r := setupSprintRouter()

	token := getAuthTokenForSprint(r, "sprint_owner@example.com", "Sprint Owner")
	projectId := createProjectForSprintTest(r, token)

	startDate := time.Now()
	endDate := startDate.Add(time.Hour * 24 * 14) // 2 weeks

	sprintReq := handlers.CreateSprintRequest{
		Name:      "Sprint 1",
		StartDate: startDate,
		EndDate:   endDate,
	}
	jsonValue, _ := json.Marshal(sprintReq)

	req, _ := http.NewRequest("POST", "/api/projects/"+projectId+"/sprints/", bytes.NewBuffer(jsonValue))
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var sprint models.Sprint
	err := json.Unmarshal(w.Body.Bytes(), &sprint)
	assert.Nil(t, err)
	assert.Equal(t, "Sprint 1", sprint.Name)
	assert.Equal(t, projectId, sprint.ProjectID)
}

func TestCreateSprintInvalidDates(t *testing.T) {
	setupSprintTestDB()
	r := setupSprintRouter()

	token := getAuthTokenForSprint(r, "sprint_dates@example.com", "Sprint User")
	projectId := createProjectForSprintTest(r, token)

	startDate := time.Now()
	endDate := startDate.Add(-time.Hour * 24) // Yesterday

	sprintReq := handlers.CreateSprintRequest{
		Name:      "Bad Sprint",
		StartDate: startDate,
		EndDate:   endDate,
	}
	jsonValue, _ := json.Marshal(sprintReq)

	req, _ := http.NewRequest("POST", "/api/projects/"+projectId+"/sprints/", bytes.NewBuffer(jsonValue))
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestSprintAccessControl(t *testing.T) {
	setupSprintTestDB()
	r := setupSprintRouter()

	ownerToken := getAuthTokenForSprint(r, "sprint_ac_owner@example.com", "Owner")
	otherToken := getAuthTokenForSprint(r, "sprint_ac_other@example.com", "Other")

	projectId := createProjectForSprintTest(r, ownerToken)

	// Other user tries to create sprint
	sprintReq := handlers.CreateSprintRequest{
		Name:      "Hacked Sprint",
		StartDate: time.Now(),
		EndDate:   time.Now().Add(time.Hour * 24),
	}
	jsonValue, _ := json.Marshal(sprintReq)

	req, _ := http.NewRequest("POST", "/api/projects/"+projectId+"/sprints/", bytes.NewBuffer(jsonValue))
	req.Header.Set("Authorization", "Bearer "+otherToken)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusForbidden, w.Code)
}

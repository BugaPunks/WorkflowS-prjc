package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"Wrk_Api/internal/database"
	"Wrk_Api/internal/handlers"
	"Wrk_Api/internal/middleware"
	"Wrk_Api/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Helper function to setup router with project routes
func setupProjectRouter() *gin.Engine {
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
			projects.GET("/", handlers.GetProjects)
			projects.GET("/:id", handlers.GetProject)
			projects.PUT("/:id", handlers.UpdateProject)
			projects.DELETE("/:id", handlers.DeleteProject)
		}
	}
	return r
}

func setupProjectTestDB() {
	var err error
	database.DB, err = gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	database.DB.AutoMigrate(&models.User{}, &models.Project{}, &models.ProjectMember{})
}

func getAuthToken(r *gin.Engine, email, name string) string {
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

func TestCreateProject(t *testing.T) {
	setupProjectTestDB()
	r := setupProjectRouter()

	token := getAuthToken(r, "owner@example.com", "Owner")

	projectReq := handlers.CreateProjectRequest{
		Name: "New Project",
	}
	jsonValue, _ := json.Marshal(projectReq)

	req, _ := http.NewRequest("POST", "/api/projects/", bytes.NewBuffer(jsonValue))
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var project models.Project
	err := json.Unmarshal(w.Body.Bytes(), &project)
	assert.Nil(t, err)
	assert.Equal(t, projectReq.Name, project.Name)
	assert.NotEmpty(t, project.ID)
	assert.NotEmpty(t, project.OwnerID)
}

func TestGetProjects(t *testing.T) {
	setupProjectTestDB()
	r := setupProjectRouter()

	token := getAuthToken(r, "user@example.com", "User")

	// Create a project first
	projectReq := handlers.CreateProjectRequest{
		Name: "My Project",
	}
	jsonValue, _ := json.Marshal(projectReq)
	req, _ := http.NewRequest("POST", "/api/projects/", bytes.NewBuffer(jsonValue))
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusCreated, w.Code)

	// Get projects
	req, _ = http.NewRequest("GET", "/api/projects/", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var projects []models.Project
	err := json.Unmarshal(w.Body.Bytes(), &projects)
	assert.Nil(t, err)
	assert.Len(t, projects, 1)
	assert.Equal(t, "My Project", projects[0].Name)
}

func TestProjectAccessControl(t *testing.T) {
	setupProjectTestDB()
	r := setupProjectRouter()

	// Ensure unique emails for this test since DB might be shared in some setups
	// or if previous tests didn't clean up fully (though setupProjectTestDB recreates it).
	// However, the issue is likely due to the helper function 'getAuthToken' trying to register
	// 'owner@example.com' which might have been registered in TestCreateProject if the DB
	// instance persists or isn't cleared.
	// But setupProjectTestDB calls sqlite memory.
	// The log shows 409 Conflict for "owner@example.com" register.
	// So we should handle "login if exists" or use unique emails.

	ownerToken := getAuthToken(r, "owner_unique@example.com", "Owner")
	otherToken := getAuthToken(r, "other_unique@example.com", "Other")

	// Owner creates project
	projectReq := handlers.CreateProjectRequest{Name: "Private Project"}
	jsonValue, _ := json.Marshal(projectReq)
	req, _ := http.NewRequest("POST", "/api/projects/", bytes.NewBuffer(jsonValue))
	req.Header.Set("Authorization", "Bearer "+ownerToken)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var project models.Project
	json.Unmarshal(w.Body.Bytes(), &project)
	projectId := project.ID

	// Other user tries to update project
	updateReq := handlers.UpdateProjectRequest{Name: "Hacked Project"}
	jsonValue, _ = json.Marshal(updateReq)
	req, _ = http.NewRequest("PUT", "/api/projects/"+projectId, bytes.NewBuffer(jsonValue))
	req.Header.Set("Authorization", "Bearer "+otherToken)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusForbidden, w.Code)

	// Owner updates project
	jsonValue, _ = json.Marshal(updateReq) // Marshal again to be safe
	req, _ = http.NewRequest("PUT", "/api/projects/"+projectId, bytes.NewBuffer(jsonValue))
	req.Header.Set("Authorization", "Bearer "+ownerToken)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

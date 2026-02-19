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

func setupUserStoryRouter() *gin.Engine {
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
			}

			stories := projects.Group("/:projectId/stories")
			{
				stories.POST("/", handlers.CreateUserStory)
				stories.GET("/", handlers.GetUserStories)
				stories.GET("/:storyId", handlers.GetUserStory)
				stories.PUT("/:storyId", handlers.UpdateUserStory)
				stories.DELETE("/:storyId", handlers.DeleteUserStory)
			}
		}
	}
	return r
}

func setupUserStoryTestDB() {
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
		&models.UserStory{},
	)
}

// Helper duplication for isolation
func getAuthTokenForStory(r *gin.Engine, email, name string) (string, string) {
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
	return response.Token, response.User.ID
}

func createProjectForStoryTest(r *gin.Engine, token string) string {
	projectReq := handlers.CreateProjectRequest{
		Name: "Story Project",
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

func createSprintForStoryTest(r *gin.Engine, token string, projectId string) string {
	sprintReq := handlers.CreateSprintRequest{
		Name:      "Story Sprint",
		StartDate: time.Now(),
		EndDate:   time.Now().Add(time.Hour * 24 * 14),
	}
	jsonValue, _ := json.Marshal(sprintReq)
	req, _ := http.NewRequest("POST", "/api/projects/"+projectId+"/sprints/", bytes.NewBuffer(jsonValue))
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var sprint models.Sprint
	json.Unmarshal(w.Body.Bytes(), &sprint)
	return sprint.ID
}

func TestCreateUserStory(t *testing.T) {
	setupUserStoryTestDB()
	r := setupUserStoryRouter()

	token, userId := getAuthTokenForStory(r, "story_owner@example.com", "Story Owner")
	projectId := createProjectForStoryTest(r, token)
	sprintId := createSprintForStoryTest(r, token, projectId)

	storyReq := handlers.CreateUserStoryRequest{
		Title:       "My First Story",
		Description: "As a user...",
		Priority:    "HIGH",
		SprintID:    &sprintId,
		AssigneeID:  &userId,
	}
	jsonValue, _ := json.Marshal(storyReq)

	req, _ := http.NewRequest("POST", "/api/projects/"+projectId+"/stories/", bytes.NewBuffer(jsonValue))
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var story models.UserStory
	err := json.Unmarshal(w.Body.Bytes(), &story)
	assert.Nil(t, err)
	assert.Equal(t, "My First Story", story.Title)
	assert.Equal(t, "HIGH", story.Priority)
	assert.Equal(t, sprintId, *story.SprintID)
	assert.Equal(t, userId, *story.AssigneeID)
}

func TestUpdateUserStoryStatus(t *testing.T) {
	setupUserStoryTestDB()
	r := setupUserStoryRouter()

	token, _ := getAuthTokenForStory(r, "status_updater@example.com", "Updater")
	projectId := createProjectForStoryTest(r, token)

	// Create Story
	storyReq := handlers.CreateUserStoryRequest{
		Title:       "To Be Done",
		Description: "...",
	}
	jsonValue, _ := json.Marshal(storyReq)
	req, _ := http.NewRequest("POST", "/api/projects/"+projectId+"/stories/", bytes.NewBuffer(jsonValue))
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var story models.UserStory
	json.Unmarshal(w.Body.Bytes(), &story)
	storyId := story.ID

	// Update Status to DONE
	newStatus := "DONE"
	updateReq := handlers.UpdateUserStoryRequest{
		Status: &newStatus,
	}
	jsonValue, _ = json.Marshal(updateReq)
	req, _ = http.NewRequest("PUT", "/api/projects/"+projectId+"/stories/"+storyId, bytes.NewBuffer(jsonValue))
	req.Header.Set("Authorization", "Bearer "+token)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var updatedStory models.UserStory
	json.Unmarshal(w.Body.Bytes(), &updatedStory)
	assert.Equal(t, "DONE", updatedStory.Status)
	assert.NotNil(t, updatedStory.CompletedAt)
}

func TestUserStoryValidation(t *testing.T) {
	setupUserStoryTestDB()
	r := setupUserStoryRouter()

	token, _ := getAuthTokenForStory(r, "validator@example.com", "Validator")
	projectId := createProjectForStoryTest(r, token)

	badSprintId := "non-existent-sprint"
	storyReq := handlers.CreateUserStoryRequest{
		Title:       "Bad Sprint Story",
		Description: "...",
		SprintID:    &badSprintId,
	}
	jsonValue, _ := json.Marshal(storyReq)

	req, _ := http.NewRequest("POST", "/api/projects/"+projectId+"/stories/", bytes.NewBuffer(jsonValue))
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

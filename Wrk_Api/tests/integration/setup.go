package integration

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"

	"Wrk_Api/internal/database"
	"Wrk_Api/internal/handlers"
	"Wrk_Api/internal/middleware"
	"Wrk_Api/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func SetupRouter() *gin.Engine {
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
			projects.GET("/:projectId", handlers.GetProject) // Renamed from :id to avoid conflict/confusion, though handlers.GetProject expects :id
			projects.PUT("/:projectId", handlers.UpdateProject)
			projects.DELETE("/:projectId", handlers.DeleteProject)

			// Use :projectId to match what the handler expects
			sprints := projects.Group("/:projectId/sprints")
			{
				sprints.POST("/", handlers.CreateSprint)
				sprints.GET("/", handlers.GetSprints)
				sprints.GET("/:sprintId", handlers.GetSprint)
				sprints.PUT("/:sprintId", handlers.UpdateSprint)
				sprints.DELETE("/:sprintId", handlers.DeleteSprint)
			}

			stories := projects.Group("/:projectId/stories")
			{
				stories.POST("/", handlers.CreateUserStory)
				stories.GET("/", handlers.GetUserStories)
				stories.GET("/:storyId", handlers.GetUserStory)
				stories.PUT("/:storyId", handlers.UpdateUserStory)
				stories.DELETE("/:storyId", handlers.DeleteUserStory)
			}

			tasks := projects.Group("/:projectId/tasks")
			{
				tasks.POST("/", handlers.CreateTask)
				tasks.GET("/", handlers.GetTasks)
				tasks.GET("/:taskId", handlers.GetTask)
				tasks.PUT("/:taskId", handlers.UpdateTask)
				tasks.DELETE("/:taskId", handlers.DeleteTask)
			}

			// Rubric Routes
			rubrics := projects.Group("/:projectId/rubrics")
			{
				rubrics.POST("/", handlers.CreateRubric)
				rubrics.GET("/", handlers.GetRubrics)
				rubrics.GET("/:rubricId", handlers.GetRubric)
				rubrics.DELETE("/:rubricId", handlers.DeleteRubric)
			}

			// Evaluation Routes
			evaluations := projects.Group("/:projectId/evaluations")
			{
				evaluations.POST("/", handlers.CreateEvaluation)
				evaluations.GET("/", handlers.GetEvaluations)
			}
		}
	}
	return r
}

func SetupTestDB() {
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
		&models.Task{},
		&models.Rubric{},
		&models.Criteria{},
		&models.Evaluation{},
		&models.EvaluationCriteria{},
		&models.RetrospectiveItem{},
		&models.Notification{},
	)
}

func GetAuthToken(r *gin.Engine, email, name string) (string, string) {
	registerReq := handlers.RegisterRequest{
		Email:    email,
		Name:     name,
		Password: "password123",
	}
	jsonValue, _ := json.Marshal(registerReq)
	req, _ := http.NewRequest("POST", "/api/auth/register", bytes.NewBuffer(jsonValue))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	// If already exists, login instead
	if w.Code == http.StatusConflict {
		loginReq := handlers.LoginRequest{
			Email:    email,
			Password: "password123",
		}
		jsonValue, _ = json.Marshal(loginReq)
		req, _ = http.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(jsonValue))
		w = httptest.NewRecorder()
		r.ServeHTTP(w, req)
	}

	var response handlers.AuthResponse
	json.Unmarshal(w.Body.Bytes(), &response)
	return response.Token, response.User.ID
}

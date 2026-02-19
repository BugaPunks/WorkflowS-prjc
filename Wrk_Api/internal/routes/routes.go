package routes

import (
	"Wrk_Api/internal/handlers"
	"Wrk_Api/internal/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		// Auth Routes (Public)
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
		}

		// User Routes (Protected)
		users := api.Group("/users")
		users.Use(middleware.AuthMiddleware())
		{
			users.POST("/", handlers.CreateUser)
			users.GET("/", handlers.GetUsers)
		}

		// Project Routes (Protected)
		projects := api.Group("/projects")
		projects.Use(middleware.AuthMiddleware())
		{
			projects.POST("/", handlers.CreateProject)
			projects.GET("/", handlers.GetProjects)
			projects.GET("/:id", handlers.GetProject)
			projects.PUT("/:id", handlers.UpdateProject)
			projects.DELETE("/:id", handlers.DeleteProject)

			// Sprint Routes (Nested under Projects)
			sprints := projects.Group("/:projectId/sprints")
			{
				sprints.POST("/", handlers.CreateSprint)
				sprints.GET("/", handlers.GetSprints)
				sprints.GET("/:sprintId", handlers.GetSprint)
				sprints.PUT("/:sprintId", handlers.UpdateSprint)
				sprints.DELETE("/:sprintId", handlers.DeleteSprint)
			}

			// User Story Routes (Nested under Projects)
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
}

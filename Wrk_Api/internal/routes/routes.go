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
	}
}

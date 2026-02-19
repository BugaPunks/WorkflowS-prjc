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

func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
		}

		users := api.Group("/users")
		users.Use(middleware.AuthMiddleware())
		{
			users.GET("/", handlers.GetUsers)
		}
	}
	return r
}

func setupTestDB() {
	var err error
	database.DB, err = gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	database.DB.AutoMigrate(&models.User{})
}

func TestRegister(t *testing.T) {
	setupTestDB()
	r := setupRouter()

	user := handlers.RegisterRequest{
		Email:    "test@example.com",
		Name:     "Test User",
		Password: "password123",
	}
	jsonValue, _ := json.Marshal(user)

	req, _ := http.NewRequest("POST", "/api/auth/register", bytes.NewBuffer(jsonValue))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var response handlers.AuthResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.Nil(t, err)
	assert.NotEmpty(t, response.Token)
	assert.Equal(t, user.Email, response.User.Email)
}

func TestLogin(t *testing.T) {
	setupTestDB()
	r := setupRouter()

	// Create user first
	password := "password123"
	registerReq := handlers.RegisterRequest{
		Email:    "login@example.com",
		Name:     "Login User",
		Password: password,
	}
	jsonValue, _ := json.Marshal(registerReq)
	req, _ := http.NewRequest("POST", "/api/auth/register", bytes.NewBuffer(jsonValue))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusCreated, w.Code)

	// Test Login
	loginReq := handlers.LoginRequest{
		Email:    "login@example.com",
		Password: password,
	}
	jsonValue, _ = json.Marshal(loginReq)
	req, _ = http.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(jsonValue))
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response handlers.AuthResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.Nil(t, err)
	assert.NotEmpty(t, response.Token)
	assert.Equal(t, registerReq.Email, response.User.Email)
}

func TestProtectedEndpoint(t *testing.T) {
	setupTestDB()
	r := setupRouter()

	// Register to get token
	registerReq := handlers.RegisterRequest{
		Email:    "protected@example.com",
		Name:     "Protected User",
		Password: "password123",
	}
	jsonValue, _ := json.Marshal(registerReq)
	req, _ := http.NewRequest("POST", "/api/auth/register", bytes.NewBuffer(jsonValue))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusCreated, w.Code)

	var response handlers.AuthResponse
	json.Unmarshal(w.Body.Bytes(), &response)
	token := response.Token

	// Access protected route without token
	req, _ = http.NewRequest("GET", "/api/users/", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusUnauthorized, w.Code)

	// Access protected route with token
	req, _ = http.NewRequest("GET", "/api/users/", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}

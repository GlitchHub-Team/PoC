package controllers

import (
	"gin-test/initializers"
	"gin-test/models"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

// Response structures
type AuthResponse struct {
	Token string           `json:"token"`
	User  UserResponse     `json:"user"`
}

type UserResponse struct {
	ID       uint            `json:"id"`
	Username string          `json:"username"`
	Tenant   *TenantResponse `json:"tenant,omitempty"`
	CreatedAt time.Time		 `json:"createdAt"`
}

type TenantResponse struct {
	ID     uint   `json:"id"`
	Name   string `json:"name"`
	NatsID string `json:"natsId"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	TenantID uint   `json:"tenantId" binding:"required"`
}

type RegisterRequest struct {
    Username string `json:"username" binding:"required"`
    Password string `json:"password" binding:"required"`
    TenantID uint   `json:"tenantId" binding:"required"`
}
/*
	Questo file è una traduzione degli altri controller 
	fatta per ritornare risposte in JSON
*/


// POST /api/login
func LoginAPI(c *gin.Context) {
	var req LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	var user models.User
	initializers.DB.Preload("Tenant").Where(
		"username = ? AND tenant_id = ?", 
		req.Username, 
		req.TenantID,
	).First(&user)

	if user.ID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword(
		[]byte(user.Password), 
		[]byte(req.Password),
	); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Genera token JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":  user.ID,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	// Body della response
	response := AuthResponse{
		Token: tokenString,
		User: UserResponse{
			ID:       user.ID,
			Username: user.Username,
			CreatedAt: user.CreatedAt,
		},
	}

	if user.Tenant.ID != 0 {
		response.User.Tenant = &TenantResponse{
			ID:     user.Tenant.ID,
			Name:   user.Tenant.Name,
			NatsID: user.Tenant.NatsID,
		}
	}

	c.JSON(http.StatusOK, response)
}

// POST api/register
func RegisterAPI(c *gin.Context) {
	var req RegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Check se username già presente 
	var existingUser models.User
	initializers.DB.Where(
		"username = ? AND tenant_id = ?",
		req.Username,
		req.TenantID,
	).First(&existingUser)

	if existingUser.ID != 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists in this tenant"})
		return
	}

	// Crea un nuovo utente
	newUser := models.User{
		Username: req.Username,
		TenantID: req.TenantID,
		Password: req.Password,
	}

	if err := newUser.Create(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
		return
	}

	// Se cerco solo per id viene sempre ritornato id=0, questo è un fix stupido
	var user models.User
	initializers.DB.Preload("Tenant").Where(
		"username = ? AND tenant_id = ?",
		req.Username,
		req.TenantID,
	).First(&user)

	// Genera token JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":  user.ID,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	// Body della response
	response := AuthResponse{
		Token: tokenString,
		User: UserResponse{
			ID:        user.ID,
			Username:  user.Username,
			CreatedAt: user.CreatedAt,
		},
	}

	if user.Tenant.ID != 0 {
		response.User.Tenant = &TenantResponse{
			ID:        user.Tenant.ID,
			Name:      user.Tenant.Name,
			NatsID:    user.Tenant.NatsID,
		}
	}

	c.JSON(http.StatusCreated, response)
}

// GET /api/tenants
func GetTenantsAPI(c *gin.Context) {
	var tenants []models.Tenant
	models.GetAllTenants(&tenants)

	var response []TenantResponse
	for _, t := range tenants {
		response = append(response, TenantResponse{
			ID:     t.ID,
			Name:   t.Name,
			NatsID: t.NatsID,
		})
	}

	c.JSON(http.StatusOK, response)
}

// GET /api/user/profile
func GetUserProfileAPI(c *gin.Context) {
	u, _ := c.Get("currentUser")
	user := u.(models.User)

	response := UserResponse{
		ID:       user.ID,
		Username: user.Username,
		CreatedAt: user.CreatedAt,
	}

	if user.Tenant.ID != 0 {
		response.Tenant = &TenantResponse{
			ID:     user.Tenant.ID,
			Name:   user.Tenant.Name,
			NatsID: user.Tenant.NatsID,
		}
	}

	c.JSON(http.StatusOK, response)
}
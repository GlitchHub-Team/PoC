package controllers

import (
	"gin-test/views"
	"gin-test/models"
	"gin-test/initializers"


	"fmt"
	"time"
	"os"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"net/http"
	"golang.org/x/crypto/bcrypt"
)

func loginControllerShowError(c *gin.Context, err error) {
	var tenants []models.Tenant
	models.GetAllTenants(&tenants)
	views.ShowView(c, gin.H{
		"result": fmt.Sprintf("Impossibile eseguire login: %v", err.Error()),
		"tenantList": tenants,
	})
}

func LoginControllerGet(c *gin.Context) {
	var tenants []models.Tenant
	models.GetAllTenants(&tenants)
	views.ShowView(c, gin.H{
		"result": "",
		"tenantList": tenants,
	})
}

func LoginControllerPost(c *gin.Context) {

	// Parsing dell'input
	var authInput models.AuthInput
	if err := c.ShouldBind(&authInput); err != nil {
		loginControllerShowError(c, err)
		return
	}

	// Cerca utente su database 
	var userFound models.User
	initializers.DB.Where("username = ?", authInput.Username,
					).Where("tenant_id = ?", authInput.TenantID,
					).Find(&userFound)

	if userFound.ID == 0 {
		loginControllerShowError(c, fmt.Errorf("credenziali invalide"))
		return
	}

	// Paragona password
	if err := bcrypt.CompareHashAndPassword(
		[]byte(userFound.Password), []byte(authInput.Password),
	); err != nil {
		loginControllerShowError(c, fmt.Errorf("credenziali invalide"))
		return
	}

	// Genera JWT
	generateToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":  userFound.ID,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	})

	token, err := generateToken.SignedString([]byte(os.Getenv("SECRET")))
	if err != nil {
		loginControllerShowError(c, fmt.Errorf("credenziali invalide %v", err))
		return
	}

	// Invia JWT tramite cookies
	// NOTA: Questo sistema non è sicuro contro attachi di CSRF, ma non importa per il PoC
	cookie := http.Cookie{
		Name: "jwt-token",
		Value: token,
		MaxAge: 86400,  
		Secure: true,
		SameSite: http.SameSiteStrictMode,
		HttpOnly: true,
	}
	c.SetCookieData(&cookie)

	c.Redirect(http.StatusFound, "/") // Riporta alla home
}

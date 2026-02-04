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

	var authInput models.AuthInput

	if err := c.ShouldBind(&authInput); err != nil {
		loginControllerShowError(c, err)
		return
	}

	var userFound models.User
	initializers.DB.Where("username = ?", authInput.Username,
					).Where("tenant_id = ?", authInput.TenantID,
					).Find(&userFound)

	if userFound.ID == 0 {
		loginControllerShowError(c, fmt.Errorf("credenziali invalide"))
		return
	}

	if err := bcrypt.CompareHashAndPassword(
		[]byte(userFound.Password), []byte(authInput.Password),
	); err != nil {
		loginControllerShowError(c, fmt.Errorf("credenziali invalide"))
		return
	}

	generateToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":  userFound.ID,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	})

	token, err := generateToken.SignedString([]byte(os.Getenv("SECRET")))
	if err != nil {
		loginControllerShowError(c, fmt.Errorf("credenziali invalide %v", err))
		return
	}

	cookie := http.Cookie{
		Name: "jwt-token",
		Value: token,
		Domain: "/",
		MaxAge: 86400,  // non è proprio sicurissimo vabbe
		Secure: true,
		SameSite: http.SameSiteStrictMode,
		HttpOnly: true,
	}

	c.SetCookieData(&cookie)

	c.Redirect(http.StatusFound, "/")

	// c.JSON(200, gin.H{"ciao": "po"})
}

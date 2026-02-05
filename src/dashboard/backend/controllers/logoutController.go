package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func LogoutController(c *gin.Context) {
	// Rimuove il token JWT
	c.SetCookieData(&http.Cookie{
		Name: "jwt-token",
		MaxAge: -1,
	})

	c.Redirect(http.StatusFound, "/")
}
package controllers

import (
	"gin-test/models"
	"gin-test/views"

	"github.com/gin-gonic/gin"
)

func GetUserProfile(c *gin.Context) {
	u, _ := c.Get("currentUser")
	user := u.(models.User)

	views.ShowView(c, gin.H{
		"username": user.Username,
		"id": user.ID,
		"createdAt": user.CreatedAt,
		"updatedAt": user.UpdatedAt,
	})
}


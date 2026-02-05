package controllers

import (
	"fmt"
	"gin-test/models"
	"gin-test/views"

	"github.com/gin-gonic/gin"
)

func IndexControllerGet(c *gin.Context) {

	u, userExists := c.Get("currentUser")
	var user models.User

	var body string

	if userExists == true {
		user = u.(models.User)
		body = fmt.Sprintf(
			"Sei loggato come '%v'. Il tuo tenant è %v",
			user.Username,
			user.Tenant.Name,
		)
	} else {
		body = "Non hai eseguito il login"
	}

	views.ShowView(c, gin.H{
		"body":  body,
	})

}

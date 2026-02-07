package controllers

import (
	"gin-test/views"
	"gin-test/models"
	"github.com/gin-gonic/gin"
	"fmt"
	"strconv"
)

func SignupControllerGet(c *gin.Context) {
	var tenants []models.Tenant
	models.GetAllTenants(&tenants)

	views.ShowView(c, gin.H{
		"title": "Crea utente",
		"result": "",
		"tenantList": tenants,
	})
}

func signupControllerShowError(c *gin.Context, err error) {
	var tenants []models.Tenant
	models.GetAllTenants(&tenants)

	views.ShowView(c, gin.H{
		"result": err.Error(),
		"tenantList": tenants,
	})
}

func SignupControllerPost(c *gin.Context) {

	var authInput models.AuthInput

	if err := c.ShouldBind(&authInput); err != nil {
		signupControllerShowError(c, fmt.Errorf(
			"Impossibile creare utente %v: %v (%v)", 
				authInput.Username, err, c.Request.PostForm,
		))
		return
	}

	tenantId, err := strconv.Atoi(authInput.TenantID)
	if err != nil {
		signupControllerShowError(c, fmt.Errorf(
			"Impossibile creare utente %v: %v", 
			authInput.Username, err,
		))
		return
	}

	user := models.User{
		Username: authInput.Username,
		TenantID: uint(tenantId),
		Password: authInput.Password,
	}
	
	if err := user.Create(); err != nil {
		signupControllerShowError(c, fmt.Errorf(
			"Impossibile creare utente %v: %v", user.Username, err,
		))
		return
	}

	views.ShowView(c, gin.H{
		"title": "Crea utente",
		"result": fmt.Sprintf("Creato utente %v con successo", user.Username),
	})
}
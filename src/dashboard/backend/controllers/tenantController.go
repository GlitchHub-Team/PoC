package controllers

import (
	"gin-test/models"
	"gin-test/views"

	"fmt"
	"github.com/gin-gonic/gin"
	"strings"
)

func TenantIndexController(c *gin.Context) {
	u, _ := c.Get("currentUser")
	user := u.(models.User)

	var users []models.User
	user.Tenant.GetAllUsers(&users)
	var userListHtml strings.Builder

	for _, user := range users {
		fmt.Fprintf(&userListHtml, "<div>%v (#%v)</div>",
			user.Username,
			user.ID,
		)
	}

	views.ShowView(c, gin.H{
		"tenant": user.Tenant,
		"userList": users,
	})

}


func TenantListController(c *gin.Context) {
	var tenants []models.Tenant
	models.GetAllTenants(&tenants)

	views.ShowView(c, gin.H{
		"tenantList": tenants,
	})
	
}


func TenantCreateGet(c *gin.Context) {
	views.ShowView(c, gin.H{
		"result": "",
	})
}

func TenantCreatePost(c *gin.Context) {
	var tenantInput models.TenantInput

	if err := c.ShouldBind(&tenantInput); err != nil {
		views.ShowView(c, gin.H{
			"result": fmt.Sprintf(
				"Impossibile creare tenant %v (ID %v): %v", 
				tenantInput.Name, tenantInput.NatsID,  err,
			),
		})
		return
	}

	tenant := models.Tenant{
		Name: tenantInput.Name,
		NatsID: tenantInput.NatsID,
	}
	
	if err := tenant.Create(); err != nil {
		views.ShowView(c, gin.H{
			"result": fmt.Sprintf(
				"Impossibile creare tenant %v (ID %v): %v", 
				tenantInput.Name, tenantInput.NatsID,  err,
			),
		})
		return
	}

	views.ShowView(c, gin.H{
		"result": fmt.Sprintf("Creato tenant %v (ID %v) con successo", tenant.Name, tenant.NatsID),
	})

}
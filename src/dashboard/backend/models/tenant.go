package models

import (
	"time"
	"gin-test/initializers"
)

type Tenant struct {
	ID        	uint   `json:"id" gorm:"primary_key"`
	NatsID		string `json:"nats_id" gorm:"unique"`
	Name	  	string `json:"name"`
	CreatedAt 	time.Time
	UpdatedAt 	time.Time
}

type TenantAlreadyExists struct {}
func (e *TenantAlreadyExists) Error() string {
	return "Questo tenant esiste già"
}

func (tenant *Tenant) Create() (err error) {
	var tenantFound Tenant
	initializers.DB.Where("name = ? and nats_id = ?", tenant.Name, tenant.NatsID).Find(&tenantFound)
	
	if tenantFound.ID != 0 {
		err = &TenantAlreadyExists{}
		return
	}

	tenant.CreatedAt = time.Now()
	tenant.UpdatedAt = time.Now()

	initializers.DB.Create(tenant)
	return
}

func (tenant Tenant) GetAllUsers(users *[]User) () {
	initializers.DB.Select("ID", "Username",
					).Where("tenant_id = ?", tenant.ID,
					).Find(users)
	return
}

func GetAllTenants(tenants *[]Tenant) (result any) {
	return initializers.DB.Select("ID", "NatsID", "Name").Find(&tenants)
}
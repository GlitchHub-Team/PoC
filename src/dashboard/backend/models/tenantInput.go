package models 

type TenantInput struct {
	Name string `json:"Name" binding:"required"`
	NatsID string `json:"NatsID" binding:"required"`
}

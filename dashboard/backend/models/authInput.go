package models

type AuthInput struct {
	TenantID string `json:"TenantID" binding:"required"`
	Username string `json:"Username" binding:"required"`
	Password string `json:"Password" binding:"required"`
}

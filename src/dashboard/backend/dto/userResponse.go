package dto

import "time"

type UserResponse struct {
	ID        uint            `json:"id"`
	Username  string          `json:"username"`
	Tenant    *TenantResponse `json:"tenant,omitempty"`
	CreatedAt time.Time       `json:"createdAt"`
}

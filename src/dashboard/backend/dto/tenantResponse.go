package dto

type TenantResponse struct {
	ID     uint   `json:"id"`
	Name   string `json:"name"`
	NatsID string `json:"natsId"`
}

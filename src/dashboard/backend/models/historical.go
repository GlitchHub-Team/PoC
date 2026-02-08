package models

import (
	"time"
)

type Metric struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	TenantID  uint      `json:"tenantId" gorm:"index"`
	Metric    string    `json:"metric" gorm:"index"`
	Timestamp time.Time `json:"timestamp" gorm:"index"`
	Value     float64   `json:"value"`
}

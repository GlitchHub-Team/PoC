package migrate

import (
	"gin-test/initializers"
	"gin-test/models"
)

func Migrate() {
	// Usa i modelli come riferimento per creare le tabelle sul DB 
	initializers.DB.AutoMigrate(&models.User{})
	initializers.DB.AutoMigrate(&models.Tenant{})
}

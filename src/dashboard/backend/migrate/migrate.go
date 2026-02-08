package migrate

import (
	"gin-test/initializers"
	"gin-test/models"
)

func Migrate() {
	initializers.DB.AutoMigrate(&models.User{})
	initializers.DB.AutoMigrate(&models.Tenant{})
}

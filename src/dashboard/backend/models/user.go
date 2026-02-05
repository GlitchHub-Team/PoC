package models

import (
	"time"
	"gin-test/initializers"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID        	uint   		`json:"id" gorm:"primary_key"`
	TenantID  	uint	 	`json:"tenant" gorm:"index:unique_index,unique"`
	Tenant 		Tenant		`gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Username  	string 		`json:"username" gorm:"index:unique_index,unique"`
	Password  	string 		`json:"password"`
	CreatedAt 	time.Time
	UpdatedAt 	time.Time
}

type UsernameAlreadyExists struct {}
func (e *UsernameAlreadyExists) Error() string {
	return "username already exists"
}

/*
Crea un utente.
La password dev'essere la password NON HASHATA!
*/
func (user User) Create() error {
	var userFound User
	initializers.DB.Where("username = ?", user.Username).Find(&userFound)

	if userFound.ID != 0 {
		return &UsernameAlreadyExists{}
	}

	var err error
	passwordHash, err := bcrypt.GenerateFromPassword(
		[]byte(user.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return err
	}

	user = User{
		Username: user.Username,
		Password: string(passwordHash),
		TenantID: user.TenantID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	initializers.DB.Create(&user)

	return nil
}

func GetUserById(user *User, id int)  {
	initializers.DB.Preload("Tenant").Where("id = ?", id).Find(&user)
}

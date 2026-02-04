package middlewares

import (
	"fmt"
	"gin-test/models"
	"gin-test/views"
	"net/http"
	"os"

	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

type NoTokenError struct {}
func (e NoTokenError) Error() string { return "Token is missing" }

type UnexpectedSigningMethodError struct {
	Method any
}
func (e UnexpectedSigningMethodError) Error() string { return fmt.Sprintf("Unexpected signing method: %v", e.Method)}

type InvalidOrExpiredTokenError struct {}
func (e InvalidOrExpiredTokenError) Error() string { return "Invalid or expired token" }

type UserNotFoundError struct {}
func (e UserNotFoundError) Error() string { return "User not found" }


/*
NOTA: Questo tipo di autenticazione non è sicuro contro attacchi di CSRF!
Per quanto riguarda il PoC, però, questo è più che sufficiente secondo me
*/
func checkAuth(c *gin.Context) error {
	tokenString, err := c.Cookie("jwt-token")
	if err != nil {
		return &NoTokenError{}
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, &UnexpectedSigningMethodError{Method: token.Header["alg"]}
		}
		return []byte(os.Getenv("SECRET")), nil
	})
	if err != nil {
		return err
	}

	if !token.Valid {
		return &InvalidOrExpiredTokenError{}
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return &InvalidOrExpiredTokenError{}
	}
	
	if float64(time.Now().Unix()) > claims["exp"].(float64) {
		return &InvalidOrExpiredTokenError{}
	}

	var user models.User
	models.GetUserById(&user, int(claims["id"].(float64)))

	if user.ID == 0 {
		return &UserNotFoundError{}
	}

	c.Set("currentUser", user)

	return nil
}

func PublicPage(c *gin.Context) {
	checkAuth(c)
	c.Next()
}

func RedirectAuthorized(c *gin.Context) {
	if _, userExists := c.Get("currentUser"); userExists {
		c.Abort()
		c.Redirect(http.StatusFound, "/")
		return
	}

	c.Next()
}

func PrivatePage(c *gin.Context) {
	err := checkAuth(c)
	if err != nil {
		c.AbortWithStatus(http.StatusUnauthorized)
		views.ErrorView(c, gin.H{"debug": err.Error(),})
		return
	}
	c.Next()
}


// func CheckAuth(c *gin.Context) {

// 	// Validate header
// 	// authHeader := c.GetHeader("Authorization")
// 	tokenString, err := c.Cookie("jwt-token")

// 	// if authHeader == "" {
// 	// 	c.JSON(http.StatusUnauthorized, gin.H{"error": "Auth header is missing"})
// 	// 	c.AbortWithStatus(http.StatusUnauthorized)
// 	// 	return
// 	// }
// 	if err != nil {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "Auth header is missing"})
// 		c.AbortWithStatus(http.StatusUnauthorized)
// 		return
// 	}


// 	// Validate token
// 	// tokenString := authToken[1]
// 	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
// 		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
// 			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
// 		}
// 		return []byte(os.Getenv("SECRET")), nil
// 	})
// 	if err != nil || !token.Valid {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
// 		c.AbortWithStatus(http.StatusUnauthorized)
// 		return
// 	}

// 	// Validate token and token expiration date
// 	claims, ok := token.Claims.(jwt.MapClaims)
// 	if !ok {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
// 		c.Abort()
// 		return
// 	}
	
// 	if float64(time.Now().Unix()) > claims["exp"].(float64) {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token expired"})
// 		c.AbortWithStatus(http.StatusUnauthorized)
// 		return
// 	}

// 	var user models.User
// 	initializers.DB.Where("ID = ?", claims["id"]).Find(&user)

// 	if user.ID == 0 {
// 		c.AbortWithStatus(http.StatusUnauthorized)
// 		return
// 	}

// 	c.Set("currentUser", user)
// 	c.Next()
// }


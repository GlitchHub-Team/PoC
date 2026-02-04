package views

import (
    "net/http"
    "strings"

    "github.com/gin-gonic/gin"

    // "fmt"
)

func ShowView(c *gin.Context, params gin.H) {

    pathString := c.Request.URL.Path
    pathString = strings.Trim(pathString, "/")

    if pathString == "" {
        pathString = "index"
    }

    c.HTML(http.StatusOK, "templates/" + pathString+".tmpl", params)

}

func ErrorView(c *gin.Context, params gin.H) {
    c.HTML(http.StatusBadRequest, "templates/error.tmpl", params)
}
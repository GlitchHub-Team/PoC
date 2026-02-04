package initializers

import (
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

// https://github.com/gin-gonic/gin/issues/2705
func LoadTemplates(router *gin.Engine, templatePath string) {
	var templateFiles []string
	err := filepath.WalkDir(templatePath, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if filepath.Ext(path) == ".tmpl" {
			templateFiles = append(templateFiles, path)
		}
		return nil
	})
	if err != nil {
		panic(err)
	}

	router.LoadHTMLFiles(templateFiles...)
}

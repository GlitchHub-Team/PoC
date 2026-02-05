package main

import (
	"gin-test/controllers"
	"gin-test/initializers"
	"gin-test/middlewares"
	"gin-test/migrate"
	"github.com/gin-gonic/gin"
)

func init() {
	initializers.LoadEnvs()
	initializers.ConnectDB()
	migrate.Migrate()
}

func main() {
	router := gin.Default()

	initializers.LoadTemplates(router, "templates")

	// Pagine accessibili a utenti non autorizzati. Chi è autorizzato viene reindirizzato a /
	onlyUnauthorized := router.Group("/")
	onlyUnauthorized.Use(middlewares.PublicPage, middlewares.RedirectAuthorized)
	{
		onlyUnauthorized.GET("/login", controllers.LoginControllerGet)
		onlyUnauthorized.POST("/login", controllers.LoginControllerPost)
		
		onlyUnauthorized.GET("/signup", controllers.SignupControllerGet)
		onlyUnauthorized.POST("/signup", controllers.SignupControllerPost)
	}

	// Pagine accessibili a chiunque
	public := router.Group("/")
	public.Use(middlewares.PublicPage)
	{	// queste parentesi graffe non servono, sono solo per separare visivamente
		public.GET("/", controllers.IndexControllerGet)
		public.GET("/logout", controllers.LogoutController)
		
		public.GET("/tenant/create", controllers.TenantCreateGet)
		public.POST("/tenant/create", controllers.TenantCreatePost)
		public.GET("/tenant/list", controllers.TenantListController)
	}

    // Pagine accessibili a utenti autorizzati
    private := router.Group("/")
    private.Use(middlewares.PrivatePage)
    {
        private.GET("/user/profile", controllers.GetUserProfile)
	
		private.GET("/tenant", controllers.TenantIndexController)
	}

	router.Run()
}

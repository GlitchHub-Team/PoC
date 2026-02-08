package main

import (
	"gin-test/controllers"
	"gin-test/initializers"
	"gin-test/middlewares"
	"gin-test/migrate"
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nats-io/nats.go"
)

func init() {
	initializers.LoadEnvs()
	initializers.ConnectDB()
	migrate.Migrate()
}

func main() {
	router := gin.Default()
	// Imposta CORS in maniera globale
	router.Use(middlewares.CORSMiddleware())

	initializers.LoadTemplates(router, "templates")

	// NATS
	creds := os.Getenv("TENANT_1_CREDS")
	caCert := os.Getenv("TENANT_CA")
	natsURL := os.Getenv("NATS_URL")

	nc, err := nats.Connect(natsURL,
		nats.UserCredentials(creds),
		nats.RootCAs(caCert),
		nats.Timeout(10*time.Second),
	)
	if err != nil {
		log.Fatal(err)
	}
	defer nc.Close()

	controllers.NatsConn = nc

	// ============ API Routes (for Angular) ============
	api := router.Group("/api")
	{
		// Public API routes
		api.POST("/login", controllers.LoginAPI)
		api.POST("/register", controllers.RegisterAPI)
		api.GET("/tenants", controllers.GetTenantsAPI)
		api.GET("/history", controllers.HistoryGet)
		api.GET("/ws/sensors/:tenant", controllers.SensorStream)

		// Protected API routes
		protected := api.Group("/")
		protected.Use(middlewares.APIAuthMiddleware())
		{
			protected.GET("/user/profile", controllers.GetUserProfileAPI)
			// ...
		}
	}

	// router.POST("/auth/signup", controllers.CreateUser)
	// router.POST("/auth/login", controllers.Login)

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
	{ // queste parentesi graffe non servono, sono solo per separare visivamente
		public.GET("/", controllers.IndexControllerGet)
		public.GET("/logout", controllers.LogoutController)

		public.GET("/tenant/create", controllers.TenantCreateGet)
		public.POST("/tenant/create", controllers.TenantCreatePost)
		public.GET("/tenant/list", controllers.TenantListController) // <-- lo messo qui per testyate

		// API endpoint for historical metrics (public for testing)

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

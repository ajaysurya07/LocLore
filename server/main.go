package main

import (
	"log"

	"github.com/ajaysurya07/LocLore/server/router/nearby"
	"github.com/ajaysurya07/LocLore/server/router/search"
	"github.com/ajaysurya07/LocLore/server/router/reminder"

	"github.com/ajaysurya07/LocLore/server/config"

	
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
)

func main() {

	cfg := config.LoadConfig()
	gin.SetMode(gin.ReleaseMode)
// r := gin.New()


r := gin.Default()
r.Use(cors.Default())


r.Use(cors.New(cors.Config{
    AllowAllOrigins:  true, 
    AllowMethods:     []string{"GET", "POST", "OPTIONS"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
    ExposeHeaders:    []string{"Content-Length"},
    AllowCredentials: true,
}))


r.Use(gin.Recovery())

    // apiGroup := r.Group("http://localhost:5000")
	 apiGroup := r.Group("/")
	{
            nearby.SetFetchNearPlacesRoutes(apiGroup.Group("/fectchNearPlaces"))
			search.SetupSearchRoutes(apiGroup.Group("/searchOnMap"))
			reminder.SubmitReminderFormRoutes(apiGroup.Group("/reminderForm"))
	}


if err := r.SetTrustedProxies(nil); err != nil {
		log.Fatal("Failed to set trusted proxies: ", err)
	}
	
	log.Printf("Server running on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
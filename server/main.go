package main

import (
	"context"
	"log"
	"time"
	"github.com/ajaysurya07/LocLore/server/router/nearby"
	"github.com/ajaysurya07/LocLore/server/router/search"
	"github.com/ajaysurya07/LocLore/server/router/reminder"
	"github.com/ajaysurya07/LocLore/server/router/geoTrigger"
	"github.com/ajaysurya07/LocLore/server/router/friend"
	"github.com/ajaysurya07/LocLore/server/router/auth"
	"github.com/ajaysurya07/LocLore/server/config"
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	cfg := config.LoadConfig()

	// Initialize database connection
	connStr := "postgres://ajay:ajay@localhost:5432/loclore?sslmode=disable"
	poolConfig, err := pgxpool.ParseConfig(connStr)
	if err != nil {
		log.Fatal("Error parsing DB config:", err)
	}

	db, err := pgxpool.NewWithConfig(context.Background(), poolConfig)
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}
	defer db.Close()

	// Test the connection
	err = db.Ping(context.Background())
	if err != nil {
		log.Fatal("Could not ping database:", err)
	}

	// Initialize Gin
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()


r.Use(gin.Logger()) 
r.Use(gin.Recovery())
r.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"http://localhost:5173"},
    AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
    ExposeHeaders:    []string{"Content-Length", "Authorization"},
    AllowCredentials: true, 
    MaxAge:           12 * time.Hour,
}))
	// API routes with db injection
	apiGroup := r.Group("/")
	{
		nearby.SetFetchNearPlacesRoutes(apiGroup.Group("/fectchNearPlaces"))
		search.SetupSearchRoutes(apiGroup.Group("/searchOnMap"))
		reminder.SubmitReminderFormRoutes(apiGroup.Group("/reminderForm"), db)
		geoTrigger.SetupGeoTrigger(apiGroup.Group("/getGeoTrigger") , db)
		friend.SetupFriends(apiGroup.Group("/friend") , db)
		auth.SetAuthRoutes(apiGroup.Group("/auth") , db)
		        		
	}

	if err := r.SetTrustedProxies(nil); err != nil {
		log.Fatal("Failed to set trusted proxies: ", err)
	}
	
	log.Printf("Server running on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
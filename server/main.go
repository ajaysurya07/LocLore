package main

import (
	"context"
	"log"

	"github.com/ajaysurya07/LocLore/server/router/nearby"
	"github.com/ajaysurya07/LocLore/server/router/search"
	"github.com/ajaysurya07/LocLore/server/router/reminder"
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

	// CORS configuration
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true, 
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.Use(gin.Recovery())

	// API routes with db injection
	apiGroup := r.Group("/")
	{
		nearby.SetFetchNearPlacesRoutes(apiGroup.Group("/fectchNearPlaces"))
		search.SetupSearchRoutes(apiGroup.Group("/searchOnMap"))
		reminder.SubmitReminderFormRoutes(apiGroup.Group("/reminderForm"), db)
	}

	if err := r.SetTrustedProxies(nil); err != nil {
		log.Fatal("Failed to set trusted proxies: ", err)
	}
	
	log.Printf("Server running on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
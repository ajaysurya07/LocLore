package geoTrigger 

import (
"log"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ajaysurya07/LocLore/server/controller/geoTrigger"
)

func SetupGeoTrigger(r *gin.RouterGroup, db *pgxpool.Pool) {
	r.GET("/", func(c *gin.Context) {
		userIDStr := c.Query("userID")
		latStr := c.Query("lat")
		lngStr := c.Query("lng")

		if userIDStr == "" || latStr == "" || lngStr == "" {
			c.JSON(400, gin.H{"error": "Missing userID, lat or lng"})
			return
		}

		userID, err1 := strconv.Atoi(userIDStr)
		lat, err2 := strconv.ParseFloat(latStr, 64)
		lng, err3 := strconv.ParseFloat(lngStr, 64)

		if err1 != nil || err2 != nil || err3 != nil {
			c.JSON(400, gin.H{"error": "Invalid format"})
			return
		}

	err := geoTrigger.NewReminderChecker(db).CheckActiveReminders(c, userID, lat, lng)
if err != nil {
    log.Printf("❌ CheckActiveReminders error: %v", err)
    c.JSON(500, gin.H{"error": "Check failed", "details": err.Error()})
    return
}


		c.JSON(200, gin.H{"status": "geoTrigger check success"})
	})
}

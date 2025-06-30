package friendsLoc

import (
	"log"
	"fmt"
	"context"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func GetFriends(c *gin.Context, db *pgxpool.Pool){
	userIDStr := c.Query("userID")
	if userIDStr == "" {
		c.JSON(400, gin.H{"error": "Missing userID"})
		return fmt.Errorf("missing userID")
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid userID format"})
		return fmt.Errorf("invalid userID format")
	}

	rows, err := db.Query(context.Background(), `
		SELECT friend_id FROM friends WHERE user_id = $1
	`, userID)
	if err != nil {
		c.JSON(500, gin.H{"error": "DB error", "details": err.Error()})
		return fmt.Errorf("db error: %w", err)
	}
	defer rows.Close()

	var friendIDs []string
	for rows.Next() {
		var friendID string
		if err := rows.Scan(&friendID); err != nil {
			log.Printf("Error scanning friend ID: %v", err)
			continue
		}
		friendIDs = append(friendIDs, friendID)
	}

	c.JSON(200, gin.H{"friends": friendIDs})
	return nil
}
package friendsLoc

import (
	"context"
	// "database/sql"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ID type remains for internal use
type ID struct {
	Value string
}

func GetFriends(c *gin.Context, db *pgxpool.Pool) {
	userIDStr := c.Query("userID")
	if userIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing userID"})
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userID format"})
		return
	}

	log.Printf("GetFriend Id controller: %d", userID)

	var idsStr string
	row := db.QueryRow(context.Background(), `
		SELECT array_to_string(friend_ids, ',') FROM friends WHERE user_id = $1
	`, userID)

	err = row.Scan(&idsStr)
	if err != nil {
		// Return empty array if not found
		c.JSON(http.StatusOK, gin.H{
			"status":    "success",
			"friendsID": []string{},
		})
		return
	}

	var responseIDs []string
	if idsStr != "" {
		for _, id := range strings.Split(idsStr, ",") {
			responseIDs = append(responseIDs, strings.TrimSpace(id))
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status":    "success",
		"friendsID": responseIDs,
	})
}

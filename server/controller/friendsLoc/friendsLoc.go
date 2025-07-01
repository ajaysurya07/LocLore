package friendsLoc

import (
	"context"
	"database/sql"
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
	log.Printf("GetFriend Id controller: %d", userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userID format"})
		return
	}

	// We'll use both types - ID for internal processing, string for response
	var internalIDs []ID
	var responseIDs []string

	row := db.QueryRow(context.Background(), `
		SELECT array_to_string(friend_ids, ',') FROM friends WHERE user_id = $1
	`, userID)
	
	var idsStr string
	err = row.Scan(&idsStr)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusOK, gin.H{"friends": []string{}})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error", "details": err.Error()})
		return
	}

	if idsStr != "" {
		// Process with internal ID type
		strIDs := strings.Split(idsStr, ",")
		internalIDs = make([]ID, len(strIDs))
		responseIDs = make([]string, len(strIDs))
		
		for i, idStr := range strIDs {
			internalIDs[i] = ID{Value: strings.TrimSpace(idStr)}
			responseIDs[i] = strings.TrimSpace(idStr) // Simple string for response
		}
	}

	log.Println("Retrieved friend IDs:")
	for i, friendID := range internalIDs {
		log.Printf("%d: %s", i+1, friendID.Value)
	}

	c.JSON(http.StatusOK, gin.H{
		"status":    "success",
		"friendsID": responseIDs, // Send simple string array
	})
}
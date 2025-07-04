package friend

import (
	"context"
	// "database/sql"
	// "github.com/google/uuid"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	// "github.com/jackc/pgx/v5"
)


type ID struct {
	Value string
}

type CreateRoomRequest struct {
	UserID string `json:"userID"`
}

type JoinRoomRequest struct {
	UserID string `json:"userID"`
	RoomID string `json:"roomId"`
}



func GetFriendIds(c *gin.Context, db *pgxpool.Pool) {
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

func CreateFriendRoom(c *gin.Context, db *pgxpool.Pool) {
	var req CreateRoomRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.UserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request or missing userID"})
		return
	}

	var roomID string
	err := db.QueryRow(context.Background(), `
		INSERT INTO friend_requests (user_id)
		VALUES ($1)
		RETURNING room_id
	`, req.UserID).Scan(&roomID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create room", "details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Room created",
		"roomID":  roomID,
	})
}


// func JoinFriendRoom(c *gin.Context, db *pgxpool.Pool) {
// 	var req JoinRoomRequest

// 	if err := c.ShouldBindJSON(&req); err != nil {
// 		log.Println("Error binding JSON:", err)
// 		c.JSON(http.StatusBadRequest, gin.H{
// 			"error":   "Invalid request payload",
// 			"details": err.Error(),
// 		})
// 		return
// 	}

// 	if req.UserID == "" || req.RoomID == "" {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing userID or roomID"})
// 		return
// 	}

// 	var requesterID string
// 	err := db.QueryRow(context.Background(), `
// 		SELECT user_id FROM friend_requests WHERE room_id = $1
// 	`, req.RoomID).Scan(&requesterID)
// 	if err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
// 		return
// 	}

// 	reqID, err := strconv.Atoi(requesterID)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid requesterID"})
// 		return
// 	}
// 	joinID, err := strconv.Atoi(req.UserID)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid joining userID"})
// 		return
// 	}

// 	// 🔍 Ensure both users have friends row
// 	createIfMissing := func(userID int) error {
// 		var exists bool
// 		err := db.QueryRow(context.Background(), `
// 			SELECT EXISTS(SELECT 1 FROM friends WHERE user_id = $1)
// 		`, userID).Scan(&exists)
// 		if err != nil {
// 			return err
// 		}
// 		if !exists {
// 			_, err = db.Exec(context.Background(), `
// 				INSERT INTO friends (user_id, friend_ids) VALUES ($1, '{}')
// 			`, userID)
// 		}
// 		return err
// 	}
// 	if err := createIfMissing(reqID); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error preparing user1", "details": err.Error()})
// 		return
// 	}
// 	if err := createIfMissing(joinID); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error preparing user2", "details": err.Error()})
// 		return
// 	}

// 	// ✅ Mutual update
// 	batch := &pgx.Batch{}
// 	batch.Queue(`
// 		UPDATE friends SET friend_ids = array_append(friend_ids, $2)
// 		WHERE user_id = $1 AND NOT (friend_ids @> ARRAY[$2])
// 	`, reqID, joinID)
// 	batch.Queue(`
// 		UPDATE friends SET friend_ids = array_append(friend_ids, $2)
// 		WHERE user_id = $1 AND NOT (friend_ids @> ARRAY[$2])
// 	`, joinID, reqID)

// 	// 🧹 Remove friend_requests row
// 	batch.Queue("DELETE FROM friend_requests WHERE room_id = $1", req.RoomID)

// 	br := db.SendBatch(context.Background(), batch)
// 	defer br.Close()

// 	if _, err := br.Exec(); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Friendship batch failed", "details": err.Error()})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{
// 		"message": "Friendship established",
// 		"data": gin.H{
// 			"user1_id":   requesterID,
// 			"user2_id":   req.UserID,
// 			"roomIDUsed": req.RoomID,
// 		},
// 	})
// }


func JoinFriendRoom(c *gin.Context, db *pgxpool.Pool) {
    var req JoinRoomRequest

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
        return
    }

    // Validate input
    if req.UserID == "" || req.RoomID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Missing userID or roomID"})
        return
    }

    // Convert string userID to int
    joiningUserID, err := strconv.Atoi(req.UserID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userID format"})
        return
    }

    // Use transaction for atomic operations
    tx, err := db.Begin(context.Background())
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not start transaction"})
        return
    }
    defer tx.Rollback(context.Background())

    // Get requester ID (already integer in DB)
    var requesterID int
    err = tx.QueryRow(context.Background(), `
        SELECT user_id FROM friend_requests WHERE room_id = $1
    `, req.RoomID).Scan(&requesterID)
    
    // if err != nil {
    //     if errors.Is(err) {
    //         c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
    //     } else {
    //         c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
    //     }
    //     return
    // }

    // Check if already friends
    var areFriends bool
    err = tx.QueryRow(context.Background(), `
        SELECT $1 = ANY(friend_ids) FROM friends WHERE user_id = $2
    `, joiningUserID, requesterID).Scan(&areFriends)
    
    if err == nil && areFriends {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Already friends"})
        return
    }

    // Add friendship both ways using proper array operations
    _, err = tx.Exec(context.Background(), `
        INSERT INTO friends (user_id, friend_ids) 
        VALUES ($1, ARRAY[$2::integer])
        ON CONFLICT (user_id) 
        DO UPDATE SET friend_ids = 
            CASE WHEN NOT friends.friend_ids @> ARRAY[$2::integer]
            THEN array_append(friends.friend_ids, $2::integer)
            ELSE friends.friend_ids
            END
    `, requesterID, joiningUserID)
    
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to update friend list",
            "details": err.Error(),
        })
        return
    }

    _, err = tx.Exec(context.Background(), `
        INSERT INTO friends (user_id, friend_ids) 
        VALUES ($1, ARRAY[$2::integer])
        ON CONFLICT (user_id) 
        DO UPDATE SET friend_ids = 
            CASE WHEN NOT friends.friend_ids @> ARRAY[$2::integer]
            THEN array_append(friends.friend_ids, $2::integer)
            ELSE friends.friend_ids
            END
    `, joiningUserID, requesterID)
    
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to update friend list",
            "details": err.Error(),
        })
        return
    }

    // Clean up friend request
    _, err = tx.Exec(context.Background(), `
        DELETE FROM friend_requests WHERE room_id = $1
    `, req.RoomID)
    
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to clean up friend request",
            "details": err.Error(),
        })
        return
    }

    // Commit transaction
    if err := tx.Commit(context.Background()); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to commit transaction",
            "details": err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "Friendship established",
        "data": gin.H{
            "user1_id":   requesterID,
            "user2_id":   joiningUserID,
            "roomIDUsed": req.RoomID,
        },
    })
}
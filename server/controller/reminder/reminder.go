package reminder

import (
	"log"
	"net/http"
	"time"
	
	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ReminderRequest struct {
	UserID   string `json:"user_id" binding:"required"`
	Name     string `json:"name" binding:"required"`
	Notes    string `json:"notes"`
	Category string `json:"category"`
}

type ReminderResponse struct {
	ID         int       `json:"id"`
	UserID     string    `json:"user_id"`
	Name       string    `json:"name"`
	Category   string    `json:"category"`
	Notes      string    `json:"notes"`
	IsActive   bool      `json:"is_active"`
	CreatedAt  time.Time `json:"created_at"`
}

func SubmitReminderForm(c *gin.Context, db *pgxpool.Pool) {
	var req ReminderRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println("Error binding JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request payload",
			"details": err.Error(),
		})
		return
	}
	query := `
		INSERT INTO geo_triggers (
			user_id, 
			name, 
			category, 
			notes,
			trigger_radius
		) 
		VALUES ($1, $2, $3, $4, $5)
		RETURNING 
			id, 
			user_id, 
			name, 
			category, 
			notes, 
			is_active, 
			created_at
	`

	var response ReminderResponse
	err := db.QueryRow(
		c.Request.Context(), // Add context here
		query,
		req.UserID,
		req.Name,
		req.Category,
		req.Notes,
		100,
	).Scan(
		&response.ID,
		&response.UserID,
		&response.Name,
		&response.Category,
		&response.Notes,
		&response.IsActive,
		&response.CreatedAt,
	)

	if err != nil {
		log.Printf("Database error: %v\n", err)
		
		if pqErr, ok := err.(*pq.Error); ok {
			switch pqErr.Code.Name() {
			case "foreign_key_violation":
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Invalid user ID",
				})
				return
			case "unique_violation":
				c.JSON(http.StatusConflict, gin.H{
					"error": "Reminder with this name already exists",
				})
				return
			}
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create reminder",
		})
		return
	}

	log.Printf("Reminder created: %+v\n", response)
	c.JSON(http.StatusCreated, gin.H{
		"status":   "success",
		"reminder": response,
	})
}
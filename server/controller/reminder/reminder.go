package reminder


import (
	"log"
	"github.com/gin-gonic/gin"
	"net/http"

)

type ReminderRequest struct {
	  Text     string     `json:"text"`
      Category string     `json:"category"`
}


func SubmitReminderForm(c *gin.Context) {
	   var req  ReminderRequest

	   if err := c.ShouldBindJSON(&req); err != nil {
		log.Println("Error binding JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request payload",
			"details": err.Error(),
		})
		return
	}

	log.Printf("Search request received: %s\n", req)
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
	})
}
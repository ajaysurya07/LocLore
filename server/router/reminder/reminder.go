package reminder

import (
	"github.com/gin-gonic/gin"
	"github.com/ajaysurya07/LocLore/server/controller/reminder"

		"github.com/jackc/pgx/v5/pgxpool"
)



func  SubmitReminderFormRoutes(r *gin.RouterGroup, db *pgxpool.Pool) {
	    // r.POST("" ,  reminder.SubmitReminderForm)

    r.POST("", func(c *gin.Context) {
        reminder.SubmitReminderForm(c, db) // Pass db to your handler
    })


		r.OPTIONS("", func(c *gin.Context) {
		c.AbortWithStatus(204)
	})
}

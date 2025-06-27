package reminder

import (
	"github.com/gin-gonic/gin"
	"github.com/ajaysurya07/LocLore/server/controller/reminder"
)



func  SubmitReminderFormRoutes(r *gin.RouterGroup) {
	    r.POST("" ,  reminder.SubmitReminderForm)

		r.OPTIONS("", func(c *gin.Context) {
		c.AbortWithStatus(204)
	})
}

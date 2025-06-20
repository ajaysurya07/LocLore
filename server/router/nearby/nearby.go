package nearby

import (
	"github.com/gin-gonic/gin"
	"github.com/ajaysurya07/LocLore/server/controller/nearby"
)



func  SetFetchNearPlacesRoutes(r *gin.RouterGroup) {
	    r.POST("" ,  nearby.FetchNearbyPlaces)

		r.OPTIONS("", func(c *gin.Context) {
		c.AbortWithStatus(204)
	})
}

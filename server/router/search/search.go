package search

import (
	"github.com/gin-gonic/gin"
	"github.com/ajaysurya07/LocLore/server/controller/search"
)

func SetupSearchRoutes(r *gin.RouterGroup) {
	  r.GET("/*query", func(c *gin.Context) {
        query := c.Param("query")
        if query != "" && query != "/" {
            query = query[1:] 
        } else {
            query = c.Query("q")
        }
        search.FetchSearchPlaceGlobally(c)
    })
    
    r.OPTIONS("/", func(c *gin.Context) {
        c.AbortWithStatus(204)
    })
}


package friendsLoc


import (
"log"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ajaysurya07/LocLore/server/controller/friendsLoc"
)


func SetupFriendsLoc(r *gin.RouterGroup, db *pgxpool.Pool) {
	r.GET("/Id", func(c *gin.Context) {
		log.Printf("SetupFriendsLoc routers  works ")
friendsLoc.GetFriends(c, db)
	})
	r.OPTIONS("/*path", func(c *gin.Context) {
	c.AbortWithStatus(204)
})
}


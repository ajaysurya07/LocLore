package friend


import (
"log"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ajaysurya07/LocLore/server/controller/friend"
)


func SetupFriends(r *gin.RouterGroup, db *pgxpool.Pool) {
	r.GET("/getIds", func(c *gin.Context) {
		log.Printf("SetupFriends routers  works ")
friend.GetFriendIds(c, db)
	})
		r.POST("/postReq", func(c *gin.Context) {
		log.Printf("SetupFriends postReq routers  works ")
friend.CreateFriendRoom(c, db)
	})
		r.POST("/acceptReq", func(c *gin.Context) {
		log.Printf("SetupFriends acceptReq  routers  works ")
friend.JoinFriendRoom(c, db)
	})
	r.OPTIONS("/*path", func(c *gin.Context) {
	c.AbortWithStatus(204)
})
}


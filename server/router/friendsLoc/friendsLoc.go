package friendsLoc


import (
// "log"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ajaysurya07/LocLore/server/controller/friendsLoc"
)


func SetupFriendsLoc(r *gin.RouterGroup, db *pgxpool.Pool) {
	r.GET("/", func(c *gin.Context) {
		

friendsLoc.GetFriends(c, db)
// if err != nil {
//     log.Printf("❌ GetFriends error: %v", err)
//     c.JSON(500, gin.H{"error": "Check failed", "details": err.Error()})
//     return
// }


		// c.JSON(200, gin.H{"status": "GetFriends check success"})
	})
}


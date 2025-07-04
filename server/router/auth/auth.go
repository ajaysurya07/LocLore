package auth 


import (

		"log"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/gin-gonic/gin"
	"github.com/ajaysurya07/LocLore/server/controller/auth"
)



func SetAuthRoutes(r *gin.RouterGroup, db *pgxpool.Pool) {
	r.POST("/signUp", func(c *gin.Context) {
		auth.SignUp(c , db)
	})
	
	r.GET("/login", func(c *gin.Context) {
		auth.Login(c , db)
	})

	r.GET("/me", func(c *gin.Context) {
		log.Printf("auth me middleware");
		auth.AuthMiddleware(c);
	})

	r.OPTIONS("/*path", func(c *gin.Context) {
	c.AbortWithStatus(204)
})

}
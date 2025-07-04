package auth 


import (
	"context"
	"log"
	"net/http"
	"time"
 "github.com/golang-jwt/jwt/v4"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)


type AuthInterface struct {
    ID       string `json:"id"`
    UserName string `json:"userName"`
    IsAuth   bool   `json:"isAuth"`
}

type SignUpForm struct {
    UserName        string `json:"userName"`
    Email          string `json:"email"`
    Password       string `json:"password"`
    ConfirmPassword string `json:"confirmPassword"`
}

type LoginForm struct {
    Email string `json:"email"`
    Password string `json:"password"`
}

type AuthUser struct {
	ID       string `json:"id"`
	UserName string `json:"userName"`
	IsAuth   bool   `json:"isAuth"`
}




func SignUp(c *gin.Context, db *pgxpool.Pool) {
	var req SignUpForm

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println("Error binding JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request payload",
			"details": err.Error(),
		})
		return
	}

	// Validate passwords match
	if req.Password != req.ConfirmPassword {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Passwords do not match",
		})
		return
	}

	// Check if username exists
	var usernameExists bool
	err := db.QueryRow(context.Background(),
		"SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)", 
		req.UserName,
	).Scan(&usernameExists)

	if err != nil {
		log.Println("Database error checking username:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to check username availability",
		})
		return
	}

	if usernameExists {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Username already exists",
		})
		return
	}

	// Check if email exists
	var emailExists bool
	err = db.QueryRow(context.Background(),
		"SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", 
		req.Email,
	).Scan(&emailExists)

	if err != nil {
		log.Println("Database error checking email:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to check email availability",
		})
		return
	}

	if emailExists {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Email already exists",
		})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Println("Error hashing password:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process password",
		})
		return
	}

	// Insert new user
	query := `
		INSERT INTO users (username, email, password, created_at)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`

	var userID int
	err = db.QueryRow(context.Background(), query,
		req.UserName,
		req.Email,
		string(hashedPassword),
		time.Now(),
	).Scan(&userID)

	if err != nil {
		log.Println("Database error creating user:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create user",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
			"message":  "User created successfully",
		"user": gin.H{
			"id":  userID,
			"userName": req.UserName,
			"isAuth":   true,
		},
	})


}

func Login(c *gin.Context, db *pgxpool.Pool) {
	emailInput := c.Query("email")
	password := c.Query("password")

	if emailInput == "" || password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email and password are required"})
		return
	}

	var (
		userID         int
		username, email, hashedPassword string
	)

	err := db.QueryRow(context.Background(),
		`SELECT id, username, email, password FROM users WHERE email = $1`,
		emailInput,
	).Scan(&userID, &username, &email, &hashedPassword)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// ✅ Generate token
	tokenStr, err := generateJWTToken(userID, username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create token"})
		return
	}

	// ✅ Set token in cookie
	c.SetCookie("token", tokenStr, 3600, "/", "localhost", false, true)
	// c.SetCookie("token", token, 3600, "/", "localhost", false, true)


	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user": gin.H{
			"id":  userID,
			"userName": username,
			"isAuth":   true,
		},
	})
}




func generateJWTToken(userID int, username string) (string, error) {
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id":  userID,
        "username": username,
        "exp":      time.Now().Add(time.Hour * 24).Unix(), 
    })

    return token.SignedString([]byte("Loveyou3000")) 
}


func AuthMiddleware(c *gin.Context) {
	tokenStr, err := c.Cookie("token")
	if err != nil || tokenStr == "" {
		c.JSON(http.StatusOK, gin.H{
			"message": "No token found",
			"user": gin.H{
				"id":       "",
				"userName": "",
				"isAuth":   false,
			},
		})
		return
	}

	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return []byte("Loveyou3000"), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusOK, gin.H{
			"message": "Invalid or expired token",
			"user": gin.H{
				"id":       "",
				"userName": "",
				"isAuth":   false,
			},
		})
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusOK, gin.H{
			"message": "Invalid claims",
			"user": gin.H{
				"id":       "",
				"userName": "",
				"isAuth":   false,
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Token fetched successfully",
		"user": gin.H{
			"id":       claims["user_id"],
			"userName": claims["username"],
			"isAuth":   true,
		},
	})
}


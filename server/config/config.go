package config

import (
    "log"
    "os"
    "github.com/joho/godotenv"
)

type Config struct {
    Port string
}

func LoadConfig() *Config {
    err := godotenv.Load()
    if err != nil {
        log.Println("No .env file found")
    }

    return &Config{
        Port: getEnv("PORT", "5000"),
    }
}

func getEnv(key, defaultValue string) string {
    value := os.Getenv(key)
    if value == "" {
        return defaultValue
    }
    return value
}
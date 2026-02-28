package config

import (
	"log"
	"os"
)

type Config struct {
	Port             string
	ProjectID        string
	CORSAllowedOrigin string
}

func Load() Config {
	port := getenvDefault("PORT", "8080")
	projectID := os.Getenv("GOOGLE_CLOUD_PROJECT")
	if projectID == "" {
		log.Println("[WARN] GOOGLE_CLOUD_PROJECT is not set; Firestore client may fail outside of emulator.")
	}

	corsOrigin := os.Getenv("CORS_ALLOWED_ORIGIN")
	if corsOrigin == "" {
		// For local development only; in Cloud Run this should be explicitly set.
		corsOrigin = "http://localhost:3000"
	}

	return Config{
		Port:             port,
		ProjectID:        projectID,
		CORSAllowedOrigin: corsOrigin,
	}
}

func getenvDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}


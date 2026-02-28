package router

import (
	"net/http"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"

	"github.com/irisakeishi/shiori/backend/config"
	"github.com/irisakeishi/shiori/backend/handlers"
	"github.com/irisakeishi/shiori/backend/services"
)

func NewRouter(cfg config.Config, firestoreClient *firestore.Client) *gin.Engine {
	r := gin.Default()

	// CORS
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", cfg.CORSAllowedOrigin)
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	fsService := services.NewFirestoreService(firestoreClient)
	ogpService := services.NewOGPService()

	boardHandler := handlers.NewBoardHandler(fsService)
	linkHandler := handlers.NewLinkHandler(fsService, ogpService)

	api := r.Group("/api")
	{
		api.POST("/boards", boardHandler.CreateBoard)
		api.GET("/me/boards", boardHandler.ListMyBoards)
		api.GET("/boards/:boardId", boardHandler.GetBoard)
		api.PATCH("/boards/:boardId", boardHandler.UpdateBoard)

		api.GET("/boards/:boardId/links", linkHandler.ListLinks)
		api.POST("/boards/:boardId/links", linkHandler.CreateLink)
		api.DELETE("/boards/:boardId/links/:linkId", linkHandler.DeleteLink)
		api.POST("/boards/:boardId/links/:linkId/reactions", linkHandler.ToggleReaction)
	}

	// Health check
	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	return r
}


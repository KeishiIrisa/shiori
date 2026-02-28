package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/irisakeishi/shiori/backend/models"
	"github.com/irisakeishi/shiori/backend/services"
)

type BoardHandler struct {
	firestore *services.FirestoreService
}

func NewBoardHandler(fs *services.FirestoreService) *BoardHandler {
	return &BoardHandler{firestore: fs}
}

type createBoardRequest struct {
	Title    string   `json:"title"`
	Members  []string `json:"members"`
	DeviceID string   `json:"device_id"` // 作成端末の一意識別子（localStorage の UUID）
}

type createBoardResponse struct {
	BoardID string `json:"board_id"`
}

// CreateBoard POST /api/boards
// Body: {"title": "...", "members": ["name1", "name2"], "device_id": "uuid"} — device_id で作成者を識別
func (h *BoardHandler) CreateBoard(c *gin.Context) {
	var req createBoardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if strings.TrimSpace(req.Title) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title is required"})
		return
	}

	members := req.Members
	if members == nil {
		members = []string{}
	}
	trimmed := make([]string, 0, len(members))
	for _, m := range members {
		if s := strings.TrimSpace(m); s != "" {
			trimmed = append(trimmed, s)
		}
	}
	members = trimmed
	if len(members) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "at least one member is required"})
		return
	}

	boardID := uuid.NewString()
	board := &models.Board{
		ID:                boardID,
		Title:             strings.TrimSpace(req.Title),
		Members:           members,
		Tags:              []string{"ご飯", "観光", "その他"},
		CreatedByDeviceID: strings.TrimSpace(req.DeviceID),
	}

	if err := h.firestore.CreateBoard(c.Request.Context(), board); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create board"})
		return
	}

	c.JSON(http.StatusOK, createBoardResponse{BoardID: boardID})
}

// ListMyBoards GET /api/me/boards?device_id=xxx&limit=20 — device_id で作成したボードを直近順で返す
func (h *BoardHandler) ListMyBoards(c *gin.Context) {
	deviceID := strings.TrimSpace(c.Query("device_id"))
	if deviceID == "" {
		c.JSON(http.StatusOK, []interface{}{})
		return
	}
	limit := 20
	if l := c.Query("limit"); l != "" {
		if n, err := parseInt(l); err == nil && n > 0 && n <= 50 {
			limit = n
		}
	}
	boards, err := h.firestore.ListBoardsByDeviceID(c.Request.Context(), deviceID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list boards"})
		return
	}
	c.JSON(http.StatusOK, boards)
}

func parseInt(s string) (int, error) {
	var n int
	_, err := fmt.Sscanf(s, "%d", &n)
	return n, err
}

// GetBoard GET /api/boards/:boardId
func (h *BoardHandler) GetBoard(c *gin.Context) {
	boardID := c.Param("boardId")
	board, err := h.firestore.GetBoard(c.Request.Context(), boardID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "board not found"})
		return
	}
	c.JSON(http.StatusOK, board)
}

// UpdateBoard PATCH /api/boards/:boardId
func (h *BoardHandler) UpdateBoard(c *gin.Context) {
	boardID := c.Param("boardId")

	var body map[string]interface{}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	// Only allow specific fields.
	allowed := map[string]bool{
		"title":   true,
		"members": true,
		"tags":    true,
	}
	updates := make(map[string]interface{})
	for k, v := range body {
		if allowed[k] {
			updates[k] = v
		}
	}
	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no valid fields to update"})
		return
	}

	if err := h.firestore.UpdateBoard(c.Request.Context(), boardID, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update board"})
		return
	}

	board, err := h.firestore.GetBoard(c.Request.Context(), boardID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read board"})
		return
	}
	c.JSON(http.StatusOK, board)
}


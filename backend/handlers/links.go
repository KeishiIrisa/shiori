package handlers

import (
	"net/http"
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/irisakeishi/shiori/backend/models"
	"github.com/irisakeishi/shiori/backend/services"
)

type LinkHandler struct {
	firestore *services.FirestoreService
	ogp       *services.OGPService
}

func NewLinkHandler(fs *services.FirestoreService, ogp *services.OGPService) *LinkHandler {
	return &LinkHandler{
		firestore: fs,
		ogp:       ogp,
	}
}

type createLinkRequest struct {
	URL      string `json:"url" binding:"required"`
	Category string `json:"category" binding:"required"`
	AddedBy  string `json:"added_by" binding:"required"`
}

// ListLinks GET /api/boards/:boardId/links
func (h *LinkHandler) ListLinks(c *gin.Context) {
	boardID := c.Param("boardId")
	links, err := h.firestore.ListLinks(c.Request.Context(), boardID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list links"})
		return
	}
	c.JSON(http.StatusOK, links)
}

// CreateLink POST /api/boards/:boardId/links
func (h *LinkHandler) CreateLink(c *gin.Context) {
	boardID := c.Param("boardId")

	var req createLinkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	ctx := c.Request.Context()

	ogpData, err := h.ogp.Fetch(ctx, req.URL)
	if err != nil {
		// フォールバック: OGP が取れなくても最低限 URL を保存する
		ogpData = &services.OGPData{
			Title:       req.URL,
			Description: "",
			ImageURL:    "",
		}
	}

	domain := extractDomain(req.URL)

	imageURL := ogpData.ImageURL
	if imageURL == "" && domain != "" {
		// サムネイルが取れなかった場合は favicon URL を image_url に使う
		imageURL = "https://www.google.com/s2/favicons?domain=" + url.QueryEscape(domain) + "&sz=128"
	}

	link := &models.Link{
		URL:         req.URL,
		Title:       ogpData.Title,
		ImageURL:    imageURL,
		Description: ogpData.Description,
		Domain:      domain,
		Category:    req.Category,
		AddedBy:     req.AddedBy,
	}

	if err := h.firestore.CreateLink(ctx, boardID, link); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create link"})
		return
	}

	// リスト再取得で一貫性を担保
	links, err := h.firestore.ListLinks(ctx, boardID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list links"})
		return
	}

	c.JSON(http.StatusOK, links)
}

type reactionRequest struct {
	Emoji  string `json:"emoji" binding:"required"`
	Member string `json:"member" binding:"required"`
}

// DeleteLink DELETE /api/boards/:boardId/links/:linkId
func (h *LinkHandler) DeleteLink(c *gin.Context) {
	boardID := c.Param("boardId")
	linkID := c.Param("linkId")
	if err := h.firestore.DeleteLink(c.Request.Context(), boardID, linkID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete link"})
		return
	}
	c.Status(http.StatusNoContent)
}

// ToggleReaction POST /api/boards/:boardId/links/:linkId/reactions
func (h *LinkHandler) ToggleReaction(c *gin.Context) {
	boardID := c.Param("boardId")
	linkID := c.Param("linkId")

	var req reactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	link, err := h.firestore.ToggleReaction(c.Request.Context(), boardID, linkID, req.Emoji, req.Member)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to toggle reaction"})
		return
	}

	c.JSON(http.StatusOK, link)
}

func extractDomain(rawURL string) string {
	u, err := url.Parse(rawURL)
	if err != nil {
		return ""
	}
	host := u.Hostname()
	// Strip common prefixes like www.
	host = strings.TrimPrefix(host, "www.")
	return host
}


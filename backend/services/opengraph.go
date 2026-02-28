package services

import (
	"context"
	"net/http"
	"time"

	"github.com/otiai10/opengraph"
)

type OGPService struct {
	httpClient *http.Client
}

func NewOGPService() *OGPService {
	return &OGPService{
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

type OGPData struct {
	Title       string
	ImageURL    string
	Description string
}

// Fetch fetches Open Graph data for the given URL.
func (s *OGPService) Fetch(ctx context.Context, targetURL string) (*OGPData, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, targetURL, nil)
	if err != nil {
		return nil, err
	}
	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	og := &opengraph.OpenGraph{}
	if err := og.Parse(resp.Body); err != nil {
		return nil, err
	}

	data := &OGPData{
		Title:       og.Title,
		Description: og.Description,
	}
	if len(og.Image) > 0 {
		data.ImageURL = og.Image[0].URL
	}
	return data, nil
}


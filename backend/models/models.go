package models

import "time"

type Board struct {
	ID                 string    `json:"id" firestore:"-"`
	Title              string    `json:"title" firestore:"title"`
	Members            []string  `json:"members" firestore:"members"`
	Tags               []string  `json:"tags" firestore:"tags"`
	CreatedByDeviceID  string    `json:"created_by_device_id" firestore:"created_by_device_id"`
	CreatedAt          time.Time `json:"created_at" firestore:"created_at"`
}

type Link struct {
	ID          string              `json:"id" firestore:"-"`
	URL         string              `json:"url" firestore:"url"`
	Title       string              `json:"title" firestore:"title"`
	ImageURL    string              `json:"image_url" firestore:"image_url"`
	Description string              `json:"description" firestore:"description"`
	Domain      string              `json:"domain" firestore:"domain"`
	Category    string              `json:"category" firestore:"category"`
	AddedBy     string              `json:"added_by" firestore:"added_by"`
	Reactions   map[string][]string `json:"reactions" firestore:"reactions"`
	CreatedAt   time.Time           `json:"created_at" firestore:"created_at"`
}


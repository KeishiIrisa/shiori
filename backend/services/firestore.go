package services

import (
	"context"
	"fmt"
	"time"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"

	"github.com/irisakeishi/shiori/backend/models"
)

type FirestoreService struct {
	client *firestore.Client
}

func NewFirestoreService(client *firestore.Client) *FirestoreService {
	return &FirestoreService{client: client}
}

func (s *FirestoreService) BoardsCollection() *firestore.CollectionRef {
	return s.client.Collection("boards")
}

func (s *FirestoreService) BoardDoc(boardID string) *firestore.DocumentRef {
	return s.BoardsCollection().Doc(boardID)
}

func (s *FirestoreService) LinksCollection(boardID string) *firestore.CollectionRef {
	return s.BoardDoc(boardID).Collection("links")
}

func (s *FirestoreService) CreateBoard(ctx context.Context, board *models.Board) error {
	board.CreatedAt = time.Now()
	_, err := s.BoardDoc(board.ID).Set(ctx, map[string]interface{}{
		"title":                 board.Title,
		"members":               board.Members,
		"tags":                  board.Tags,
		"created_by_device_id": board.CreatedByDeviceID,
		"created_at":            board.CreatedAt,
	})
	return err
}

func (s *FirestoreService) GetBoard(ctx context.Context, boardID string) (*models.Board, error) {
	doc, err := s.BoardDoc(boardID).Get(ctx)
	if err != nil {
		return nil, err
	}
	var board models.Board
	if err := doc.DataTo(&board); err != nil {
		return nil, err
	}
	board.ID = doc.Ref.ID
	return &board, nil
}

func (s *FirestoreService) UpdateBoard(ctx context.Context, boardID string, fields map[string]interface{}) error {
	var updates []firestore.Update
	for k, v := range fields {
		updates = append(updates, firestore.Update{Path: k, Value: v})
	}
	_, err := s.BoardDoc(boardID).Update(ctx, updates)
	return err
}

// ListBoardsByDeviceID は created_by_device_id が一致するボードを created_at 降順で最大 limit 件返す。
// Firestore の複合インデックス: boards: created_by_device_id (Asc), created_at (Desc)
func (s *FirestoreService) ListBoardsByDeviceID(ctx context.Context, deviceID string, limit int) ([]models.Board, error) {
	if deviceID == "" {
		return []models.Board{}, nil
	}
	if limit <= 0 || limit > 50 {
		limit = 20
	}
	iter := s.BoardsCollection().
		Where("created_by_device_id", "==", deviceID).
		OrderBy("created_at", firestore.Desc).
		Limit(limit).
		Documents(ctx)
	defer iter.Stop()
	var boards []models.Board
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}
		var b models.Board
		if err := doc.DataTo(&b); err != nil {
			return nil, err
		}
		b.ID = doc.Ref.ID
		boards = append(boards, b)
	}
	return boards, nil
}

func (s *FirestoreService) ListLinks(ctx context.Context, boardID string) ([]models.Link, error) {
	snapshots, err := s.LinksCollection(boardID).OrderBy("created_at", firestore.Desc).Documents(ctx).GetAll()
	if err != nil {
		return nil, err
	}
	links := make([]models.Link, 0, len(snapshots))
	for _, snap := range snapshots {
		var link models.Link
		if err := snap.DataTo(&link); err != nil {
			return nil, err
		}
		link.ID = snap.Ref.ID
		links = append(links, link)
	}
	return links, nil
}

func (s *FirestoreService) DeleteLink(ctx context.Context, boardID, linkID string) error {
	_, err := s.LinksCollection(boardID).Doc(linkID).Delete(ctx)
	return err
}

func (s *FirestoreService) CreateLink(ctx context.Context, boardID string, link *models.Link) error {
	link.CreatedAt = time.Now()
	if link.Reactions == nil {
		link.Reactions = make(map[string][]string)
	}
	_, _, err := s.LinksCollection(boardID).Add(ctx, map[string]interface{}{
		"url":         link.URL,
		"title":       link.Title,
		"image_url":   link.ImageURL,
		"description": link.Description,
		"domain":      link.Domain,
		"category":    link.Category,
		"added_by":    link.AddedBy,
		"reactions":   link.Reactions,
		"created_at":  link.CreatedAt,
	})
	return err
}

func (s *FirestoreService) ToggleReaction(ctx context.Context, boardID, linkID, emoji, member string) (*models.Link, error) {
	docRef := s.LinksCollection(boardID).Doc(linkID)
	err := s.client.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		snap, err := tx.Get(docRef)
		if err != nil {
			return err
		}

		var link models.Link
		if err := snap.DataTo(&link); err != nil {
			return err
		}
		if link.Reactions == nil {
			link.Reactions = make(map[string][]string)
		}

		current := link.Reactions[emoji]
		found := false
		newList := make([]string, 0, len(current))
		for _, name := range current {
			if name == member {
				found = true
				continue
			}
			newList = append(newList, name)
		}
		if !found {
			newList = append(newList, member)
		}
		link.Reactions[emoji] = newList

		if err := tx.Set(docRef, map[string]interface{}{
			"url":         link.URL,
			"title":       link.Title,
			"image_url":   link.ImageURL,
			"description": link.Description,
			"domain":      link.Domain,
			"category":    link.Category,
			"added_by":    link.AddedBy,
			"reactions":   link.Reactions,
			"created_at":  link.CreatedAt,
		}, firestore.MergeAll); err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	// Read back the updated link.
	snap, err := s.LinksCollection(boardID).Doc(linkID).Get(ctx)
	if err != nil {
		return nil, err
	}
	var link models.Link
	if err := snap.DataTo(&link); err != nil {
		return nil, err
	}
	link.ID = snap.Ref.ID
	return &link, nil
}

func (s *FirestoreService) Close() error {
	return s.client.Close()
}

func (s *FirestoreService) Ping(ctx context.Context) error {
	// Simple check by listing boards with a small limit.
	iter := s.BoardsCollection().Limit(1).Documents(ctx)
	_, err := iter.Next()
	if err != nil && err != iterator.Done {
		return fmt.Errorf("firestore ping failed: %w", err)
	}
	return nil
}


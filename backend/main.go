package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"cloud.google.com/go/firestore"

	"github.com/irisakeishi/shiori/backend/config"
	"github.com/irisakeishi/shiori/backend/router"
)

func main() {
	cfg := config.Load()

	ctx := context.Background()
	firestoreClient, err := firestore.NewClient(ctx, cfg.ProjectID)
	if err != nil {
		log.Fatalf("failed to create firestore client: %v", err)
	}
	defer firestoreClient.Close()

	r := router.NewRouter(cfg, firestoreClient)

	srvErrCh := make(chan error, 1)
	go func() {
		if err := r.Run(":" + cfg.Port); err != nil {
			srvErrCh <- err
		}
	}()

	// Graceful shutdown on SIGINT/SIGTERM.
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-sigCh:
		log.Printf("shutting down on signal: %s", sig.String())
		// Give some time for in-flight requests (Gin will stop accepting new ones).
		time.Sleep(2 * time.Second)
	case err := <-srvErrCh:
		log.Fatalf("server error: %v", err)
	}
}


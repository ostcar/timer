package web

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/ostcar/timer/model"
)

// Run starts the webserver on the given port
func Run(ctx context.Context, model *model.Model, addr string, defaultFiles DefaultFiles) error {
	router := mux.NewRouter()
	registerHandlers(router, model, defaultFiles)

	srv := &http.Server{Addr: addr, Handler: router}

	// Shutdown logic in separate goroutine.
	wait := make(chan error)
	go func() {
		// Wait for the context to be closed.
		<-ctx.Done()

		if err := srv.Shutdown(context.Background()); err != nil {
			wait <- fmt.Errorf("HTTP server shutdown: %w", err)
			return
		}
		wait <- nil
	}()

	log.Printf("Listen webserver on: %s", addr)
	if err := srv.ListenAndServe(); err != http.ErrServerClosed {
		return fmt.Errorf("HTTP Server failed: %v", err)
	}

	return <-wait
}
package web

import (
	"context"
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/ostcar/timer/config"
	"github.com/ostcar/timer/model"
)

//go:embed client/index.html
var defaultIndex []byte

//go:embed client/elm.js
var defaultElm []byte

//go:embed static
var defaultStatic embed.FS

// Run starts the webserver on the given port
func Run(ctx context.Context, model *model.Model, cfg config.Config) error {
	static, err := fs.Sub(defaultStatic, "static")
	if err != nil {
		return fmt.Errorf("open static folder: %w", err)
	}

	defaultFiles := Files{
		Index:  defaultIndex,
		Elm:    defaultElm,
		Static: static,
	}

	router := mux.NewRouter()
	registerHandlers(router, model, cfg, defaultFiles)

	srv := &http.Server{Addr: cfg.WebListenAddr, Handler: router}

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

	log.Printf("Listen webserver on: %s", cfg.WebListenAddr)
	if err := srv.ListenAndServe(); err != http.ErrServerClosed {
		return fmt.Errorf("HTTP Server failed: %v", err)
	}

	return <-wait
}

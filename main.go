package main

import (
	"context"
	"embed"
	"fmt"
	"log"
	"os"
	"os/signal"

	"github.com/ostcar/timer/grpc"
	"github.com/ostcar/timer/model"
	"github.com/ostcar/timer/web"
	"golang.org/x/sync/errgroup"
)

const (
	grpcAddr = ":4040"
	httpAddr = ":8080"
)

//go:embed client/index.html
var defaultIndex []byte

//go:embed client/elm.js
var defaultElm []byte

//go:embed static/*
var defaultStatic embed.FS

func main() {
	if err := run(); err != nil {
		log.Printf("Error: %v", err)
		os.Exit(1)
	}
}

func run() error {
	ctx, cancel := interruptContext()
	defer cancel()

	model, err := model.NewModel("db.jsonl")
	if err != nil {
		return fmt.Errorf("loading model: %w", err)
	}

	var group *errgroup.Group
	group, ctx = errgroup.WithContext(ctx)

	group.Go(func() error {
		if err := grpc.Run(ctx, model, grpcAddr); err != nil {
			return fmt.Errorf("running grpc server: %w", err)
		}
		return nil
	})

	group.Go(func() error {
		defaultFiles := web.DefaultFiles{
			Index:  defaultIndex,
			Elm:    defaultElm,
			Static: defaultStatic,
		}

		if err := web.Run(ctx, model, httpAddr, defaultFiles); err != nil {
			return fmt.Errorf("running http server: %w", err)
		}
		return nil
	})

	return group.Wait()
}

// interruptContext works like signal.NotifyContext
//
// In only listens on os.Interrupt. If the signal is received two times,
// os.Exit(1) is called.
func interruptContext() (context.Context, context.CancelFunc) {
	ctx, cancel := context.WithCancel(context.Background())
	go func() {
		sigint := make(chan os.Signal, 1)
		signal.Notify(sigint, os.Interrupt)
		<-sigint
		cancel()

		// If the signal was send for the second time, make a hard cut.
		<-sigint
		os.Exit(1)
	}()
	return ctx, cancel
}

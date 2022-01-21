package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"

	"github.com/ostcar/timer/grpc"
	"github.com/ostcar/timer/model"
)

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

	// TODO: use error group
	if err := grpc.Run(ctx, model, "4040"); err != nil {
		return fmt.Errorf("running grpc server: %w", err)
	}

	return nil
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

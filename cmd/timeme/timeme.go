package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/ostcar/timer/grpc/proto"
	"github.com/spf13/cobra"
	"google.golang.org/grpc"
)

func main() {
	if err := rootCmd().Execute(); err != nil {
		log.Printf("Error: %v", err)
		os.Exit(1)
	}
}

func connect() (proto.TimerClient, func() error, error) {
	conn, err := grpc.Dial("localhost:4040", grpc.WithInsecure())
	if err != nil {
		return nil, nil, fmt.Errorf("creating connection: %w", err)
	}

	client := proto.NewTimerClient(conn)
	return client, conn.Close, nil
}

func rootCmd() *cobra.Command {
	cmd := cobra.Command{
		Use:           "timeme",
		Short:         "times your work",
		Long:          `timeme times your work using the timer-server.`,
		SilenceErrors: true,
		SilenceUsage:  true,
	}

	cmd.AddCommand(
		startCmd(),
		stopCmd(),
	)

	return &cmd
}

func startCmd() *cobra.Command {
	cmd := cobra.Command{
		Use:   "start [comment]",
		Short: "start working",
		Long:  "start working with an optional comment",
	}

	cmd.RunE = func(cmd *cobra.Command, args []string) error {
		client, close, err := connect()
		if err != nil {
			return fmt.Errorf("creating client: %w", err)
		}
		defer close()

		comment := ""
		if len(args) > 0 {
			comment = args[0]
		}

		if _, err := client.Start(context.Background(), &proto.StartRequest{Comment: comment}); err != nil {
			return fmt.Errorf("sending start request: %w", err)
		}
		return nil
	}

	return &cmd
}

func stopCmd() *cobra.Command {
	cmd := cobra.Command{
		Use:   "stop [comment]",
		Short: "stop working",
		Long:  "stop working with an optional comment",
	}

	cmd.RunE = func(cmd *cobra.Command, args []string) error {
		client, close, err := connect()
		if err != nil {
			return fmt.Errorf("creating client: %w", err)
		}
		defer close()

		hasComment := false
		comment := ""
		if len(args) > 0 {
			comment = args[0]
			hasComment = true
		}

		if _, err := client.Stop(context.Background(), &proto.StopRequest{HasComment: hasComment, Comment: comment}); err != nil {
			return fmt.Errorf("sending stop request: %w", err)
		}
		return nil
	}

	return &cmd
}

package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"sort"
	"strconv"
	"time"

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
		listCmd(),
		editCmd(),
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

func listCmd() *cobra.Command {
	cmd := cobra.Command{
		Use:   "list",
		Short: "list the work",
		Long:  "list all finished periodes of work",
	}

	timeFormat := cmd.Flags().String("time_format", "2006-01-02 15:04:05", "format string to parse the timestamps. See golang time.")
	reverse := cmd.Flags().Bool("reverse", false, "show results in reverse order")

	cmd.RunE = func(cmd *cobra.Command, args []string) error {
		client, close, err := connect()
		if err != nil {
			return fmt.Errorf("creating client: %w", err)
		}
		defer close()

		resp, err := client.List(context.Background(), &proto.ListRequest{})
		if err != nil {
			return fmt.Errorf("sending list request: %w", err)
		}

		sort.Slice(resp.Periodes, func(i, j int) bool {
			if *reverse {
				return resp.Periodes[i].Start > resp.Periodes[j].Start
			}
			return resp.Periodes[i].Start < resp.Periodes[j].Start
		})

		for _, p := range resp.Periodes {
			comment := ""
			if p.Comment != "" {
				comment = ": " + p.Comment
			}
			start := time.Unix(p.Start, 0)
			stop := time.Unix(p.Stop, 0)
			fmt.Printf("%d: %s - %s%s\n", p.Id, start.Format(*timeFormat), stop.Format(*timeFormat), comment)
		}
		return nil
	}

	return &cmd
}

func editCmd() *cobra.Command {
	cmd := cobra.Command{
		Use:   "edit id",
		Short: "edit an periode",
		Long:  "edit an existing periode",
	}

	start := cmd.Flags().String("start", "", "change the start time")
	stop := cmd.Flags().String("stop", "", "change the stop time")
	comment := cmd.Flags().String("comment", "", "change the comment")
	timeFormat := cmd.Flags().String("time_format", "2006-01-02 15:04:05", "format string to parse the timestamps. See golang time.")

	cmd.RunE = func(cmd *cobra.Command, args []string) error {
		client, close, err := connect()
		if err != nil {
			return fmt.Errorf("creating client: %w", err)
		}
		defer close()

		if len(args) == 0 {
			return fmt.Errorf("No id given")
		}

		id, err := strconv.Atoi(args[0])
		if err != nil {
			return fmt.Errorf("Invalid id: %w", err)
		}

		// TODO: Handle case where --comment was set to an empty string
		hasComment := len(*comment) > 0
		hasStart := len(*start) > 0
		hasStop := len(*stop) > 0

		var unixStart int64
		if hasStart {
			t, err := time.Parse(*timeFormat, *start)
			if err != nil {
				return fmt.Errorf("parsing start time: %w", err)
			}
			unixStart = t.Unix()
		}

		var unixStop int64
		if hasStop {
			t, err := time.Parse(*timeFormat, *stop)
			if err != nil {
				return fmt.Errorf("parsing stop time: %w", err)
			}
			unixStop = t.Unix()
		}

		if _, err := client.Edit(context.Background(), &proto.EditRequest{
			Id:         int32(id),
			HasStart:   hasStart,
			Start:      unixStart,
			HasStop:    hasStop,
			Stop:       unixStop,
			HasComment: hasComment,
			Comment:    *comment,
		}); err != nil {
			return fmt.Errorf("sending stop request: %w", err)
		}
		return nil
	}

	return &cmd
}

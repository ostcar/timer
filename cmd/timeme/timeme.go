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

func connect(domain string) (proto.TimerClient, func() error, error) {
	conn, err := grpc.Dial(domain, grpc.WithInsecure())
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

	domain := cmd.PersistentFlags().StringP("domain", "d", "localhost:4040", "domain of the timer server")

	cmd.AddCommand(
		startCmd(domain),
		stopCmd(domain),
		listCmd(domain),
		editCmd(domain),
		insertCmd(domain),
		deleteCmd(domain),
	)

	return &cmd
}

func startCmd(domain *string) *cobra.Command {
	cmd := cobra.Command{
		Use:   "start [comment]",
		Short: "start working",
		Long:  "start working with an optional comment",
	}

	cmd.RunE = func(cmd *cobra.Command, args []string) error {
		client, close, err := connect(*domain)
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

func stopCmd(domain *string) *cobra.Command {
	cmd := cobra.Command{
		Use:   "stop [comment]",
		Short: "stop working",
		Long:  "stop working with an optional comment",
	}

	cmd.RunE = func(cmd *cobra.Command, args []string) error {
		client, close, err := connect(*domain)
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

func listCmd(domain *string) *cobra.Command {
	cmd := cobra.Command{
		Use:   "list",
		Short: "list the work",
		Long:  "list all finished periodes of work",
	}

	timeFormat := cmd.Flags().String("time_format", "2006-01-02 15:04:05", "format string to parse the timestamps. See golang time.")
	reverse := cmd.Flags().Bool("reverse", false, "show results in reverse order")

	cmd.RunE = func(cmd *cobra.Command, args []string) error {
		log.Println(domain)
		client, close, err := connect(*domain)
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

func editCmd(domain *string) *cobra.Command {
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
		client, close, err := connect(*domain)
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
			t, err := time.ParseInLocation(*timeFormat, *start, time.Local)
			if err != nil {
				return fmt.Errorf("parsing start time: %w", err)
			}
			unixStart = t.UTC().Unix()
		}

		var unixStop int64
		if hasStop {
			t, err := time.ParseInLocation(*timeFormat, *stop, time.Local)
			if err != nil {
				return fmt.Errorf("parsing stop time: %w", err)
			}
			unixStop = t.UTC().Unix()
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

func insertCmd(domain *string) *cobra.Command {
	cmd := cobra.Command{
		Use:   "insert start stop [comment]",
		Short: "insert an periode",
		Long:  "insert a new peridode",
	}

	timeFormat := cmd.Flags().String("time_format", "2006-01-02 15:04:05", "format string to parse the timestamps. See golang time.")

	cmd.RunE = func(cmd *cobra.Command, args []string) error {
		client, close, err := connect(*domain)
		if err != nil {
			return fmt.Errorf("creating client: %w", err)
		}
		defer close()

		if len(args) < 3 {
			return fmt.Errorf("Not enough arguments")
		}

		start, err := time.ParseInLocation(*timeFormat, args[0], time.Local)
		if err != nil {
			return fmt.Errorf("parsing start time: %w", err)
		}

		stop, err := time.ParseInLocation(*timeFormat, args[1], time.Local)
		if err != nil {
			return fmt.Errorf("parsing stop time: %w", err)
		}

		comment := ""
		hasComment := false
		if len(args) >= 3 {
			hasComment = true
			comment = args[2]
		}

		if _, err := client.Insert(context.Background(), &proto.InsertRequest{
			Start:      start.UTC().Unix(),
			Stop:       stop.UTC().Unix(),
			HasComment: hasComment,
			Comment:    comment,
		}); err != nil {
			return fmt.Errorf("sending insert request: %w", err)
		}
		return nil
	}

	return &cmd
}

func deleteCmd(domain *string) *cobra.Command {
	cmd := cobra.Command{
		Use:   "delete id",
		Short: "delete an periode",
		Long:  "edit an existing periode by its id",
	}

	cmd.RunE = func(cmd *cobra.Command, args []string) error {
		client, close, err := connect(*domain)
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

		if _, err := client.Delete(context.Background(), &proto.DeleteRequest{
			Id: int32(id),
		}); err != nil {
			return fmt.Errorf("sending delete request: %w", err)
		}
		return nil
	}

	return &cmd
}

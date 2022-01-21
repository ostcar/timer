package grpc

import (
	"context"
	"fmt"
	"log"
	"net"

	"github.com/ostcar/timer/grpc/proto"
	"github.com/ostcar/timer/maybe"
	"github.com/ostcar/timer/model"
	"google.golang.org/grpc"
)

// Run starts the grpc server on the given port.
func Run(ctx context.Context, model *model.Model, port string) error {
	addr := ":" + port
	lis, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("listen on address %q: %w", addr, err)
	}

	registrar := grpc.NewServer()
	timerServer := grpcServer{model}

	proto.RegisterTimerServer(registrar, timerServer)

	go func() {
		<-ctx.Done()
		registrar.GracefulStop()
	}()

	log.Printf("Running grpc server on %s\n", addr)
	if err := registrar.Serve(lis); err != nil {
		return fmt.Errorf("running grpc server: %w", err)
	}

	return nil
}

type grpcServer struct {
	model *model.Model
}

func (s grpcServer) Start(ctx context.Context, req *proto.StartRequest) (*proto.StartResponse, error) {
	if err := s.model.Start(req.Comment); err != nil {
		return nil, fmt.Errorf("starting timer: %w", err)
	}
	return new(proto.StartResponse), nil
}

func (s grpcServer) Stop(ctx context.Context, req *proto.StopRequest) (*proto.StopResponse, error) {
	comment := maybe.String{}
	if req.HasComment {
		comment = maybe.NewString(req.Comment)
	}

	if err := s.model.Stop(comment); err != nil {
		return nil, fmt.Errorf("starting timer: %w", err)
	}
	return new(proto.StopResponse), nil
}

package grpc

import (
	"context"
	"fmt"
	"log"
	"net"
	"time"

	"github.com/ostcar/timer/grpc/proto"
	"github.com/ostcar/timer/model"
	"google.golang.org/grpc"
)

// Run starts the grpc server on the given port.
func Run(ctx context.Context, model *model.Model, addr string) error {
	lis, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("listen on address %q: %w", addr, err)
	}

	registrar := grpc.NewServer()
	timerServer := grpcServer{model}

	proto.RegisterTimerServer(registrar, timerServer)

	wait := make(chan struct{})
	go func() {
		<-ctx.Done()
		registrar.GracefulStop()
		wait <- struct{}{}
	}()

	log.Printf("Running grpc server on %s\n", addr)
	if err := registrar.Serve(lis); err != nil {
		return fmt.Errorf("running grpc server: %w", err)
	}

	<-wait

	return nil
}

type grpcServer struct {
	model *model.Model
}

func (s grpcServer) Start(ctx context.Context, req *proto.StartRequest) (*proto.StartResponse, error) {
	if err := s.model.Start(model.Just(req.Comment)); err != nil {
		return nil, fmt.Errorf("starting timer: %w", err)
	}
	return new(proto.StartResponse), nil
}

func (s grpcServer) Stop(ctx context.Context, req *proto.StopRequest) (*proto.StopResponse, error) {
	var comment model.Maybe[string]
	if req.HasComment {
		comment = model.Just(req.Comment)
	}

	id, err := s.model.Stop(comment)

	if err != nil {
		return nil, fmt.Errorf("stopping timer: %w", err)
	}
	return &proto.StopResponse{Id: int32(id)}, nil
}

func (s grpcServer) List(ctx context.Context, req *proto.ListRequest) (*proto.ListResponse, error) {
	modelPeriodes := s.model.List()
	protoPeriodes := make([]*proto.Periode, len(modelPeriodes))
	for i, p := range modelPeriodes {
		comment, hasComment := p.Comment.Value()
		protoPeriodes[i] = &proto.Periode{
			Id:         int32(p.ID),
			Start:      p.Start.Unix(),
			Duration:   int64(p.Duration.Seconds()),
			Comment:    comment,
			HasComment: hasComment,
		}
	}
	return &proto.ListResponse{Periodes: protoPeriodes}, nil
}

func (s grpcServer) Edit(ctx context.Context, req *proto.EditRequest) (*proto.EditResponse, error) {
	var start model.Maybe[model.JSONTime]
	if req.HasStart {
		start = model.Just(model.JSONTime(time.Unix(req.Start, 0)))
	}

	var duration model.Maybe[model.JSONDuration]
	if req.HasDuration {
		duration = model.Just(model.JSONDuration(time.Duration(req.Duration) * time.Second))
	}

	var comment model.Maybe[string]
	if req.HasComment {
		comment = model.Just(req.Comment)
	}

	if err := s.model.Edit(int(req.Id), start, duration, comment); err != nil {
		return nil, fmt.Errorf("editing periode: %w", err)
	}
	return new(proto.EditResponse), nil
}

func (s grpcServer) Insert(ctx context.Context, req *proto.InsertRequest) (*proto.InsertResponse, error) {
	start := time.Unix(req.Start, 0)
	duration := time.Duration(req.Duration) * time.Second

	var comment model.Maybe[string]
	if req.HasComment {
		comment = model.Just(req.Comment)
	}

	id, err := s.model.Insert(start, duration, comment)

	if err != nil {
		return nil, fmt.Errorf("inserting periode: %w", err)
	}
	return &proto.InsertResponse{Id: int32(id)}, nil
}

func (s grpcServer) Delete(ctx context.Context, req *proto.DeleteRequest) (*proto.DeleteResponse, error) {
	if err := s.model.Delete(int(req.Id)); err != nil {
		return nil, fmt.Errorf("starting timer: %w", err)
	}
	return new(proto.DeleteResponse), nil
}

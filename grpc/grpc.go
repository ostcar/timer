package grpc

import (
	"context"
	"fmt"
	"log"
	"net"
	"time"

	"github.com/ostcar/timer/grpc/proto"
	"github.com/ostcar/timer/model"
	"github.com/ostcar/timer/sticky"
	"google.golang.org/grpc"
)

// Run starts the grpc server on the given port.
func Run(ctx context.Context, s *sticky.Sticky[model.Model], addr string) error {
	lis, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("listen on address %q: %w", addr, err)
	}

	registrar := grpc.NewServer()
	timerServer := grpcServer{s}

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
	s *sticky.Sticky[model.Model]
}

func (s grpcServer) Start(ctx context.Context, req *proto.StartRequest) (*proto.StartResponse, error) {
	err := s.s.Write(func(m model.Model) sticky.Event[model.Model] {
		return m.Start(model.Just(req.Comment))
	})
	if err != nil {
		return nil, fmt.Errorf("starting timer: %w", err)
	}
	return new(proto.StartResponse), nil
}

func (s grpcServer) Stop(ctx context.Context, req *proto.StopRequest) (*proto.StopResponse, error) {
	var comment model.Maybe[string]
	if req.HasComment {
		comment = model.Just(req.Comment)
	}

	var id int
	err := s.s.Write(func(m model.Model) sticky.Event[model.Model] {
		eventID, event := m.Stop(comment)
		id = eventID
		return event
	})

	if err != nil {
		return nil, fmt.Errorf("stopping timer: %w", err)
	}
	return &proto.StopResponse{Id: int32(id)}, nil
}

func (s grpcServer) List(ctx context.Context, req *proto.ListRequest) (*proto.ListResponse, error) {
	var modelPeriodes []model.Periode
	s.s.Read(func(m model.Model) {
		modelPeriodes = m.List()
	})

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
	var start model.Maybe[sticky.JSONTime]
	if req.HasStart {
		start = model.Just(sticky.JSONTime(time.Unix(req.Start, 0)))
	}

	var duration model.Maybe[sticky.JSONDuration]
	if req.HasDuration {
		duration = model.Just(sticky.JSONDuration(time.Duration(req.Duration) * time.Second))
	}

	var comment model.Maybe[string]
	if req.HasComment {
		comment = model.Just(req.Comment)
	}

	err := s.s.Write(func(m model.Model) sticky.Event[model.Model] {
		return m.Edit(int(req.Id), start, duration, comment)
	})
	if err != nil {
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

	var id int
	err := s.s.Write(func(m model.Model) sticky.Event[model.Model] {
		eventID, event := m.Insert(start, duration, comment)
		id = eventID
		return event
	})
	if err != nil {
		return nil, fmt.Errorf("inserting periode: %w", err)
	}

	return &proto.InsertResponse{Id: int32(id)}, nil
}

func (s grpcServer) Delete(ctx context.Context, req *proto.DeleteRequest) (*proto.DeleteResponse, error) {
	err := s.s.Write(func(m model.Model) sticky.Event[model.Model] {
		return m.Delete(int(req.Id))
	})
	if err != nil {
		return nil, fmt.Errorf("starting timer: %w", err)
	}
	return new(proto.DeleteResponse), nil
}

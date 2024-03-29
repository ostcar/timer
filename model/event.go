package model

import (
	"fmt"
	"time"

	"github.com/ostcar/timer/sticky"
)

// GetEvent returns an empty event for a name.
func GetEvent(eventType string) Event {
	switch eventType {
	case eventStart{}.Name():
		return &eventStart{}

	case eventStop{}.Name():
		return &eventStop{}

	case eventEditV1{}.Name():
		return &eventEditV1{}

	case eventEditV2{}.Name():
		return &eventEditV2{}

	case eventInsertV1{}.Name():
		return &eventInsertV1{}

	case eventInsertV2{}.Name():
		return &eventInsertV2{}

	case eventDelete{}.Name():
		return &eventDelete{}

	case eventBilled{}.Name():
		return &eventBilled{}

	default:
		return nil
	}
}

type eventStart struct {
	Comment Maybe[string] `json:"comment"`
}

func (e eventStart) Name() string {
	return "start"
}

func (e eventStart) Validate(model Model) error {
	if !model.current.start.IsZero() {
		return fmt.Errorf("Timer is already started")
	}
	return nil
}

func (e eventStart) Execute(model Model, time time.Time) Model {
	model.current.start = time
	model.current.comment = e.Comment
	return model
}

type eventStop struct {
	ID      int           `json:"id"`
	Comment Maybe[string] `json:"comment"`
}

func (e eventStop) Name() string {
	return "stop"
}

func (e eventStop) Validate(model Model) error {
	if e.ID == 0 {
		return fmt.Errorf("ID is required")
	}

	if _, ok := model.periodes[e.ID]; ok {
		return fmt.Errorf("ID is already used")
	}

	if model.current.start.IsZero() {
		return fmt.Errorf("Timer is not started")
	}
	return nil
}

func (e eventStop) Execute(model Model, eventTime time.Time) Model {
	comment := model.current.comment

	if _, ok := e.Comment.Value(); ok {
		comment = e.Comment
	}

	p := Periode{
		ID:       e.ID,
		Start:    model.current.start,
		Duration: eventTime.Sub(model.current.start),
		Comment:  comment,
	}

	model.periodes[e.ID] = p
	model.current.start = time.Time{}
	model.current.comment = Maybe[string]{}
	return model
}

type eventInsertV1 struct {
	ID      int             `json:"id"`
	Start   sticky.JSONTime `json:"start"`
	Stop    sticky.JSONTime `json:"stop"`
	Comment Maybe[string]   `json:"comment"`
}

func (e eventInsertV1) Name() string {
	return "insert"
}

func (e eventInsertV1) Validate(model Model) error {
	if e.ID == 0 {
		return fmt.Errorf("ID is required")
	}

	if _, ok := model.periodes[e.ID]; ok {
		return fmt.Errorf("ID is taken ")
	}

	// TODO: Validate, that start is before stop and does not overlap with other periodes.

	return nil
}

func (e eventInsertV1) Execute(model Model, eventTime time.Time) Model {
	p := Periode{
		ID:       e.ID,
		Start:    time.Time(e.Start),
		Duration: time.Time(e.Stop).Sub(time.Time(e.Start)),
		Comment:  e.Comment,
	}

	model.periodes[e.ID] = p

	return model
}

type eventInsertV2 struct {
	ID       int                 `json:"id"`
	Start    sticky.JSONTime     `json:"start"`
	Duration sticky.JSONDuration `json:"duration"`
	Comment  Maybe[string]       `json:"comment"`
}

func (e eventInsertV2) Name() string {
	return "insertV2"
}

func (e eventInsertV2) Validate(model Model) error {
	if e.ID == 0 {
		return fmt.Errorf("ID is required")
	}

	if _, ok := model.periodes[e.ID]; ok {
		return fmt.Errorf("ID is taken")
	}

	// TODO: Validate, that start is before stop and does not overlap with other periodes.

	return nil
}

func (e eventInsertV2) Execute(model Model, eventTime time.Time) Model {
	p := Periode{
		ID:       e.ID,
		Start:    time.Time(e.Start),
		Duration: time.Duration(e.Duration),
		Comment:  e.Comment,
	}

	model.periodes[e.ID] = p

	return model
}

type eventDelete struct {
	ID int `json:"id"`
}

func (e eventDelete) Name() string {
	return "delete"
}

func (e eventDelete) Validate(model Model) error {
	if e.ID == 0 {
		return fmt.Errorf("ID is required")
	}

	if _, ok := model.periodes[e.ID]; !ok {
		return fmt.Errorf("ID is unknown")
	}

	return nil
}

func (e eventDelete) Execute(model Model, eventTime time.Time) Model {
	delete(model.periodes, e.ID)
	return model
}

type eventEditV1 struct {
	ID      int                    `json:"id"`
	Start   Maybe[sticky.JSONTime] `json:"start"`
	Stop    Maybe[sticky.JSONTime] `json:"stop"`
	Comment Maybe[string]          `json:"comment"`
}

func (e eventEditV1) Name() string {
	return "edit"
}

func (e eventEditV1) Validate(model Model) error {
	if e.ID == 0 {
		return fmt.Errorf("ID is required")
	}

	if _, ok := model.periodes[e.ID]; !ok {
		return fmt.Errorf("ID is unknown")
	}

	// TODO: Validate, that start is before stop and does not overlap with other periodes.

	return nil
}

func (e eventEditV1) Execute(model Model, eventTime time.Time) Model {
	p := model.periodes[e.ID]

	if start, ok := e.Start.Value(); ok {
		p.Start = time.Time(start)
	}

	if stop, ok := e.Stop.Value(); ok {
		p.Duration = time.Time(stop).Sub(p.Start)
	}

	if _, ok := e.Comment.Value(); ok {
		p.Comment = e.Comment
	}

	model.periodes[e.ID] = p

	return model
}

type eventEditV2 struct {
	ID       int                        `json:"id"`
	Start    Maybe[sticky.JSONTime]     `json:"start"`
	Duration Maybe[sticky.JSONDuration] `json:"duration"`
	Comment  Maybe[string]              `json:"comment"`
	Billed   Maybe[bool]                `json:"billed"`
}

func (e eventEditV2) Name() string {
	return "editV2"
}

func (e eventEditV2) Validate(model Model) error {
	if e.ID == 0 {
		return fmt.Errorf("ID is required")
	}

	if _, ok := model.periodes[e.ID]; !ok {
		return fmt.Errorf("ID is unknown")
	}

	// TODO: Validate, that start is before stop and does not overlap with other periodes.

	return nil
}

func (e eventEditV2) Execute(model Model, eventTime time.Time) Model {
	p := model.periodes[e.ID]

	if start, ok := e.Start.Value(); ok {
		p.Start = time.Time(start)
	}

	if duration, ok := e.Duration.Value(); ok {
		p.Duration = time.Duration(duration)
	}

	if _, ok := e.Comment.Value(); ok {
		p.Comment = e.Comment
	}

	if billed, ok := e.Billed.Value(); ok {
		p.Billed = billed
	}

	model.periodes[e.ID] = p

	return model
}

type eventBilled struct {
	IDs    []int `json:"ids"`
	Billed bool  `json:"billed"`
}

func (e eventBilled) Name() string {
	return "billed"
}

func (e eventBilled) Validate(model Model) error {
	if len(e.IDs) == 0 {
		return fmt.Errorf("At least one ID is required")
	}

	for i, id := range e.IDs {
		if id <= 0 {
			return fmt.Errorf("all ids have to be greater then 0. %dth id is %d", i, id)
		}

		if _, ok := model.periodes[id]; !ok {
			return fmt.Errorf("%dth id %d is unknown unknown", i, id)
		}
	}

	return nil
}

func (e eventBilled) Execute(model Model, eventTime time.Time) Model {
	for _, id := range e.IDs {
		p := model.periodes[id]
		p.Billed = e.Billed
		model.periodes[id] = p
	}

	return model
}

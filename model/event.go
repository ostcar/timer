package model

import (
	"fmt"
	"time"

	"github.com/ostcar/timer/maybe"
)

func getEvent(eventType string) Event {
	switch eventType {
	case eventStart{}.Name():
		return &eventStart{}

	case eventStop{}.Name():
		return &eventStop{}

	default:
		return nil
	}
}

// Event is one change of the model.
type Event interface {
	validate(db *Model) error
	execute(db *Model, time time.Time) error
	Name() string
}

type eventStart struct {
	Comment string `json:"comment"`
}

func (e eventStart) String() string {
	return fmt.Sprintf("Start with comment `%s`", e.Comment)
}

func (e eventStart) Name() string {
	return "start"
}

func (e eventStart) validate(model *Model) error {
	if !model.current.start.IsZero() {
		return validationError{"Timer is already started"}
	}
	return nil
}

func (e eventStart) execute(model *Model, time time.Time) error {
	model.current.start = time
	model.current.comment = e.Comment
	return nil
}

type eventStop struct {
	ID      int          `json:"id"`
	Comment maybe.String `json:"comment"`
}

func (e eventStop) String() string {
	comment, ok := e.Comment.Value()
	if ok {
		return fmt.Sprintf("End with comment `%s`", comment)
	}
	return fmt.Sprintf("End without comment")
}

func (e eventStop) Name() string {
	return "stop"
}

func (e eventStop) validate(model *Model) error {
	if e.ID == 0 {
		return validationError{"ID is required"}
	}

	if _, ok := model.periodes[e.ID]; ok {
		return validationError{"ID is already used"}
	}

	if model.current.start.IsZero() {
		return validationError{"Timer is not started"}
	}
	return nil
}

func (e eventStop) execute(model *Model, eventTime time.Time) error {
	comment := model.current.comment
	c, ok := e.Comment.Value()
	if ok {
		comment = c
	}

	p := periode{
		start:   model.current.start,
		end:     eventTime,
		comment: comment,
	}

	model.periodes[e.ID] = p
	model.current.start = time.Time{}
	model.current.comment = ""
	return nil
}

type validationError struct {
	msg string
}

func (e validationError) Error() string {
	return e.msg
}

func (e validationError) forClient() string {
	return "Ungültige Daten: " + e.msg
}

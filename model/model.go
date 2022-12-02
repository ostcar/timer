package model

import (
	"log"
	"time"

	"github.com/ostcar/timer/sticky"
)

// Model holds the data in memory.
type Model struct {
	current struct {
		start   time.Time
		comment Maybe[string]
	}

	periodes map[int]Periode
}

// Periode is a duration of time.
type Periode struct {
	ID       int
	Start    time.Time
	Duration time.Duration
	Comment  Maybe[string]
}

// Start starts the timer.
func (m Model) Start(comment Maybe[string]) sticky.Event[Model] {
	log.Printf("start event")
	return eventStart{Comment: comment}
}

// Stop stops the timer.
func (m Model) Stop(comment Maybe[string]) (int, sticky.Event[Model]) {
	log.Printf("stop event")
	nextID := m.nextID()

	return nextID, eventStop{Comment: comment, ID: nextID}
}

func (m Model) nextID() int {
	nextID := 1
	for id := range m.periodes {
		if nextID <= id {
			nextID = id + 1
		}
	}
	return nextID
}

// Delete removes an existing periode.
func (m Model) Delete(id int) sticky.Event[Model] {
	log.Printf("delete event for %d", id)
	return eventDelete{ID: id}
}

// Insert creates a new periode.
func (m *Model) Insert(start time.Time, duration time.Duration, comment Maybe[string]) (int, sticky.Event[Model]) {
	log.Printf("insert event")
	nextID := m.nextID()
	return nextID, eventInsertV2{ID: nextID, Start: sticky.JSONTime(start), Duration: sticky.JSONDuration(duration), Comment: comment}
}

// Edit changes an existing periode.
func (m *Model) Edit(id int, start Maybe[sticky.JSONTime], duration Maybe[sticky.JSONDuration], comment Maybe[string]) sticky.Event[Model] {
	log.Printf("Log event for id %d", id)
	return eventEditV2{ID: id, Start: start, Duration: duration, Comment: comment}
}

// List returns all periodes.
func (m *Model) List() []Periode {
	periodes := make([]Periode, 0, len(m.periodes))
	for _, p := range m.periodes {
		periodes = append(periodes, p)
	}
	return periodes
}

// Running tells if the timer is currently running.
//
// If its running, it returns the start time and the comment.
func (m *Model) Running() (start time.Time, comment Maybe[string], ok bool) {
	if m.current.start.IsZero() {
		return time.Time{}, Maybe[string]{}, false
	}

	return m.current.start, m.current.comment, true
}

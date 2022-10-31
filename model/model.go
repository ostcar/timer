package model

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"sync"
	"time"
)

const timeFormat = "2006-01-02 15:04:05"

// Model holds the data in memory and saves them to disk.
type Model struct {
	mu sync.RWMutex
	db database

	now func() time.Time

	current struct {
		start   time.Time
		comment Maybe[string]
	}

	periodes map[int]Periode
}

// Periode is a duration of time.
type Periode struct {
	ID      int
	Start   time.Time
	Stop    time.Time
	Comment Maybe[string]
}

type database interface {
	Reader() (io.ReadCloser, error)
	Append([]byte) error
}

// New load the db from file.
func New(db database) (*Model, error) {
	dbReader, err := db.Reader()
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}
	defer dbReader.Close()

	model, err := loadDatabase(dbReader)
	if err != nil {
		return nil, fmt.Errorf("loading database: %w", err)
	}

	model.db = db
	model.now = time.Now

	return model, nil
}

func loadDatabase(r io.Reader) (*Model, error) {
	db := &Model{periodes: make(map[int]Periode)}

	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		line := bytes.TrimSpace(scanner.Bytes())
		if len(line) == 0 {
			continue
		}

		var typer struct {
			Type    string          `json:"type"`
			Time    string          `json:"time"`
			Payload json.RawMessage `json:"payload"`
		}
		if err := json.Unmarshal(line, &typer); err != nil {
			return nil, fmt.Errorf("decoding event: %w", err)
		}

		event := getEvent(typer.Type)
		if event == nil {
			return nil, fmt.Errorf("unknown event `%s`, payload `%s`", typer.Type, typer.Payload)
		}

		if err := json.Unmarshal(typer.Payload, &event); err != nil {
			return nil, fmt.Errorf("loading event `%s`: %w", typer.Type, err)
		}

		eventTime, err := time.Parse(timeFormat, typer.Time)
		if err != nil {
			return nil, fmt.Errorf("event `%s` has invalid time %s: %w", typer.Type, typer.Time, err)
		}

		if err := event.execute(db, eventTime); err != nil {
			return nil, fmt.Errorf("executing event `%s`: %w", typer.Type, err)
		}
	}
	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("scanning events: %w", err)
	}

	return db, nil
}

func (m *Model) writeEvent(e Event) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if err := e.validate(m); err != nil {
		return fmt.Errorf("validating event: %w", err)
	}

	now := m.now().UTC()
	event := struct {
		Time    string `json:"time"`
		Type    string `json:"type"`
		Payload Event  `json:"payload"`
	}{
		now.Format(timeFormat),
		e.Name(),
		e,
	}

	bs, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("encoding event: %w", err)
	}

	if err := m.db.Append(bs); err != nil {
		return fmt.Errorf("writing event to db: `%s`: %w", bs, err)
	}

	if err := e.execute(m, now); err != nil {
		return fmt.Errorf("executing event: %w", err)
	}

	return nil
}

// Start starts the timer.
func (m *Model) Start(comment Maybe[string]) error {
	log.Printf("start event")
	if err := m.writeEvent(eventStart{Comment: comment}); err != nil {
		return fmt.Errorf("writing event: %w", err)
	}
	return nil
}

// Stop stops the timer.
func (m *Model) Stop(comment Maybe[string]) (int, error) {
	log.Printf("stop event")
	nextID := m.nextID()

	if err := m.writeEvent(eventStop{Comment: comment, ID: nextID}); err != nil {
		return 0, fmt.Errorf("writing event: %w", err)
	}
	return nextID, nil
}

func (m *Model) nextID() int {
	// TODO: This is not concurent save. There has probybly be a field model.maxID
	m.mu.RLock()
	defer m.mu.RUnlock()

	nextID := 1
	for id := range m.periodes {
		if nextID <= id {
			nextID = id + 1
		}
	}
	return nextID
}

// Delete removes an existing periode.
func (m *Model) Delete(id int) error {
	log.Printf("delete event for %d", id)
	if err := m.writeEvent(eventDelete{ID: id}); err != nil {
		return fmt.Errorf("writing event: %w", err)
	}
	return nil
}

// Insert creates a new periode.
func (m *Model) Insert(start, stop time.Time, comment Maybe[string]) (int, error) {
	log.Printf("insert event")
	nextID := m.nextID()
	if err := m.writeEvent(eventInsert{ID: nextID, Start: JSONTime(start), Stop: JSONTime(stop), Comment: comment}); err != nil {
		return 0, fmt.Errorf("writing event: %w", err)
	}
	return nextID, nil
}

// Edit changes an existing periode.
func (m *Model) Edit(id int, start, stop Maybe[JSONTime], comment Maybe[string]) error {
	log.Printf("Log event for id %d", id)
	if err := m.writeEvent(eventEdit{ID: id, Start: start, Stop: stop, Comment: comment}); err != nil {
		return fmt.Errorf("writing event: %w", err)
	}
	return nil
}

// List returns all periodes.
func (m *Model) List() []Periode {
	m.mu.RLock()
	defer m.mu.RUnlock()

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
	m.mu.RLock()
	defer m.mu.RUnlock()

	if m.current.start.IsZero() {
		return time.Time{}, Maybe[string]{}, false
	}

	return m.current.start, m.current.comment, true
}

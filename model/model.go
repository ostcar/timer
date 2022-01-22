package model

import (
	"bufio"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"sync"
	"time"

	"github.com/ostcar/timer/maybe"
)

const timeFormat = "2006-01-02 15:04:05"

// Model holds the data in memory and saves them to disk.
type Model struct {
	mu   sync.RWMutex
	file string

	current struct {
		start   time.Time
		comment maybe.String
	}

	periodes map[int]Periode
}

// Periode is a duration of time.
type Periode struct {
	ID      int
	Start   time.Time
	Stop    time.Time
	Comment maybe.String
}

// NewModel load the db from file.
func NewModel(file string) (*Model, error) {
	db, err := openDB(file)
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}

	db.file = file
	return db, nil
}

func openDB(file string) (*Model, error) {
	f, err := os.Open(file)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return emptyDatabase(), nil
		}
		return nil, fmt.Errorf("open database file: %w", err)
	}
	defer f.Close()

	db, err := loadDatabase(f)
	if err != nil {
		return nil, fmt.Errorf("loading database: %w", err)
	}
	return db, nil
}

func emptyDatabase() *Model {
	return &Model{periodes: make(map[int]Periode)}
}

func loadDatabase(r io.Reader) (*Model, error) {
	db := emptyDatabase()

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
			return nil, fmt.Errorf("unknown event %q, payload %q", typer.Type, typer.Payload)
		}

		if err := json.Unmarshal(typer.Payload, &event); err != nil {
			return nil, fmt.Errorf("loading event %q: %w", typer.Type, err)
		}

		eventTime, err := time.Parse(timeFormat, typer.Time)
		if err != nil {
			return nil, fmt.Errorf("event %q has invalid time %s: %w", typer.Type, typer.Time, err)
		}

		if err := event.execute(db, eventTime); err != nil {
			return nil, fmt.Errorf("executing event %q: %w", typer.Type, err)
		}
	}
	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("scanning events: %w", err)
	}

	return db, nil
}

func (m *Model) writeEvent(e Event) (err error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if err := e.validate(m); err != nil {
		return fmt.Errorf("validating event: %w", err)
	}

	f, err := os.OpenFile(m.file, os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0600)
	if err != nil {
		return fmt.Errorf("open db file: %w", err)
	}
	defer func() {
		wErr := f.Close()
		if err != nil {
			err = wErr
		}
	}()

	now := time.Now()
	event := struct {
		Type    string `json:"type"`
		Time    string `json:"time"`
		Payload Event  `json:"payload"`
	}{
		e.Name(),
		now.Format(timeFormat),
		e,
	}

	bs, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("encoding event: %w", err)
	}

	bs = append(bs, '\n')

	if _, err := f.Write(bs); err != nil {
		return fmt.Errorf("writing event to file: %q: %w", bs, err)
	}

	if err := e.execute(m, now); err != nil {
		return fmt.Errorf("executing event: %w", err)
	}

	return nil
}

// Start starts the timer.
func (m *Model) Start(comment maybe.String) error {
	log.Printf("start event")
	if err := m.writeEvent(eventStart{Comment: comment}); err != nil {
		return fmt.Errorf("writing event: %w", err)
	}
	return nil
}

// Stop stops the timer.
func (m *Model) Stop(comment maybe.String) (int, error) {
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
	m.mu.RUnlock()
	return nextID
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

// Delete removes an existing periode.
func (m *Model) Delete(id int) error {
	log.Printf("delete event for %d", id)
	if err := m.writeEvent(eventDelete{ID: id}); err != nil {
		return fmt.Errorf("writing event: %w", err)
	}
	return nil
}

// Insert creates a new periode.
func (m *Model) Insert(start, stop time.Time, comment maybe.String) (int, error) {
	log.Printf("insert event")
	nextID := m.nextID()
	if err := m.writeEvent(eventInsert{ID: nextID, Start: start, Stop: stop, Comment: comment}); err != nil {
		return 0, fmt.Errorf("writing event: %w", err)
	}
	return nextID, nil
}

// Edit changes an existing periode.
func (m *Model) Edit(id int, start, stop maybe.Time, comment maybe.String) error {
	log.Printf("Log event for id %d", id)
	if err := m.writeEvent(eventEdit{ID: id, Start: start, Stop: stop, Comment: comment}); err != nil {
		return fmt.Errorf("writing event: %w", err)
	}
	return nil
}

package sticky

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"sync"
	"time"
)

// Event is a set of functions that can modify a model.
type Event[Model any] interface {
	Validate(Model) error
	Execute(Model, time.Time) Model
	Name() string
}

type database interface {
	Reader() (io.ReadCloser, error)
	Append([]byte) error
}

// Sticky is some sort of db that persists a model on disk in a event storage
// way.
type Sticky[Model any] struct {
	mu    sync.RWMutex
	model Model

	now func() time.Time
	db  database
}

// New initializes a new Sticky instance.
func New[Model any](db database, getEvent func(name string) Event[Model], os ...Option[Model]) (*Sticky[Model], error) {
	dbReader, err := db.Reader()
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}
	defer dbReader.Close()

	model, err := loadModel(dbReader, getEvent)
	if err != nil {
		return nil, fmt.Errorf("loading database: %w", err)
	}

	s := Sticky[Model]{
		model: model,
		now:   time.Now,
		db:    db,
	}
	return &s, nil
}

func loadModel[Model any](r io.Reader, getEvent func(name string) Event[Model]) (Model, error) {
	var model Model
	var zero Model

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
			return zero, fmt.Errorf("decoding event: %w", err)
		}

		event := getEvent(typer.Type)
		if event == nil {
			return zero, fmt.Errorf("unknown event `%s`, payload `%s`", typer.Type, typer.Payload)
		}

		if err := json.Unmarshal(typer.Payload, &event); err != nil {
			return zero, fmt.Errorf("loading event `%s`: %w", typer.Type, err)
		}

		eventTime, err := time.Parse(timeFormat, typer.Time)
		if err != nil {
			return zero, fmt.Errorf("event `%s` has invalid time %s: %w", typer.Type, typer.Time, err)
		}

		model = event.Execute(model, eventTime)
	}
	if err := scanner.Err(); err != nil {
		return zero, fmt.Errorf("scanning events: %w", err)
	}

	return model, nil
}

// Read calls a function that has access to an instance of the model for
// reading.
func (s *Sticky[Model]) Read(f func(Model)) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	f(s.model)
}

// Write calls a function that has access to an instance of the model for
// writing. It has to return an event.
//
// Write can return a ValidationError or ExecutionError when the event can not
// be processed.
func (s *Sticky[Model]) Write(f func(Model) Event[Model]) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	event := f(s.model)

	if err := event.Validate(s.model); err != nil {
		return ValidationError{err}
	}

	now := s.now().UTC()
	rawEvent := struct {
		Time    string       `json:"time"`
		Type    string       `json:"type"`
		Payload Event[Model] `json:"payload"`
	}{
		now.Format(timeFormat),
		event.Name(),
		event,
	}

	bs, err := json.Marshal(rawEvent)
	if err != nil {
		return fmt.Errorf("encoding event: %w", err)
	}

	if err := s.db.Append(bs); err != nil {
		return fmt.Errorf("writing event to db: `%s`: %w", bs, err)
	}

	s.model = event.Execute(s.model, s.now())

	return nil
}

// ValidationError happens, when the event can not be validated.
type ValidationError struct {
	err error
}

func (err ValidationError) Error() string {
	return fmt.Sprintf("Validation Error: %v", err.err)
}

func (err ValidationError) Unwrap() error {
	return err.err
}

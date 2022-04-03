package model

import (
	"encoding/json"
	"fmt"
)

// Maybe is the value or null.
//
// The zero value is null.
type Maybe[T any] struct {
	value T
	set   bool
}

// Just creates a Maybe with a value.
func Just[T any](value T) Maybe[T] {
	return Maybe[T]{value: value, set: true}
}

func (m Maybe[T]) Value() (value T, exist bool) {
	if m.set {
		return m.value, true
	}
	return value, false
}

// MarshalJSON encodes the value from json.
func (m Maybe[T]) MarshalJSON() ([]byte, error) {
	v, ok := m.Value()
	if !ok {
		return []byte("null"), nil
	}
	return json.Marshal(v)
}

// UnmarshalJSON decodes the value from json.
func (m *Maybe[T]) UnmarshalJSON(bs []byte) error {
	if string(bs) == "null" {
		var zero T
		m.value = zero
		m.set = false
		return nil
	}

	if err := json.Unmarshal(bs, &m.value); err != nil {
		return fmt.Errorf("unmarshaling value: %w", err)
	}
	m.set = true
	return nil
}

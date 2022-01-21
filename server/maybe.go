package server

import (
	"encoding/json"
	"fmt"
)

type maybeString struct {
	v   string
	set bool
}

func (m *maybeString) value() (string, bool) {
	if m.set {
		return m.v, true
	}
	return "", false
}

func (m *maybeString) MarshalJSON() ([]byte, error) {
	v, ok := m.value()
	if !ok {
		return []byte("null"), nil
	}
	return json.Marshal(v)
}

func (m *maybeString) UnmarshalJSON(bs []byte) error {
	if string(bs) == "null" {
		m.v = ""
		m.set = false
		return nil
	}

	if err := json.Unmarshal(bs, &m.v); err != nil {
		return fmt.Errorf("unmarshaling value: %w", err)
	}
	m.set = true
	return nil
}

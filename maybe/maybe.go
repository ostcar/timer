package maybe

import (
	"encoding/json"
	"fmt"
	"time"
)

// String is a string or null.
type String struct {
	value string
	set   bool
}

// NewString create a new maybe.String with a value.
//
// To create a null-maybe.string, just use the zero-value.
func NewString(value string) String {
	return String{value: value, set: true}
}

// Value returns the value and with the second return argument, if the value is
// set.
func (m String) Value() (string, bool) {
	if m.set {
		return m.value, true
	}
	return "", false
}

func (m String) String() string {
	v, ok := m.Value()
	if ok {
		return v
	}
	return "null"
}

// MarshalJSON encodes the value from json.
func (m String) MarshalJSON() ([]byte, error) {
	v, ok := m.Value()
	if !ok {
		return []byte("null"), nil
	}
	return json.Marshal(v)
}

// UnmarshalJSON decodes the value from json.
func (m *String) UnmarshalJSON(bs []byte) error {
	if string(bs) == "null" {
		m.value = ""
		m.set = false
		return nil
	}

	if err := json.Unmarshal(bs, &m.value); err != nil {
		return fmt.Errorf("unmarshaling value: %w", err)
	}
	m.set = true
	return nil
}

const timeFormat = "2006-01-02 15:04:05"

// Time is a string or null.
type Time struct {
	value time.Time
	set   bool
}

// NewTime create a new maybe.Time with a value.
//
// To create a null-maybe.Time, just use the zero-value.
func NewTime(value time.Time) Time {
	return Time{value: value, set: true}
}

// Value returns the value and with the second return argument, if the value is
// set.
func (m Time) Value() (time.Time, bool) {
	if m.set {
		return m.value, true
	}
	return time.Time{}, false
}

// MarshalJSON encodes the value from json.
func (m Time) MarshalJSON() ([]byte, error) {
	v, ok := m.Value()
	if !ok {
		return []byte("null"), nil
	}
	return json.Marshal(v.Format(timeFormat))
}

// UnmarshalJSON decodes the value from json.
func (m *Time) UnmarshalJSON(bs []byte) error {
	if string(bs) == "null" {
		m.value = time.Time{}
		m.set = false
		return nil
	}

	var v string
	if err := json.Unmarshal(bs, &v); err != nil {
		return fmt.Errorf("unmarshaling value: %w", err)
	}
	t, err := time.Parse(timeFormat, v)
	if err != nil {
		return fmt.Errorf("parsing time: %w", err)
	}

	m.value = t
	m.set = true
	return nil
}

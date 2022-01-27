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

// Int64 is a int64 or null.
type Int64 struct {
	value int64
	set   bool
}

// NewInt64 create a new maybe.Int64 with a value.
//
// To create a null-maybe-int64, just use the zero-value.
func NewInt64(value int64) Int64 {
	return Int64{value: value, set: true}
}

// Value returns the value and with the second return argument, if the value is
// set.
func (m Int64) Value() (int64, bool) {
	if m.set {
		return m.value, true
	}
	return 0, false
}

// MarshalJSON encodes the value from json.
func (m Int64) MarshalJSON() ([]byte, error) {
	v, ok := m.Value()
	if !ok {
		return []byte("null"), nil
	}
	return json.Marshal(v)
}

// UnmarshalJSON decodes the value from json.
func (m *Int64) UnmarshalJSON(bs []byte) error {
	if string(bs) == "null" {
		m.value = 0
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

// JSONTime is a time type with a consum marshaling to json.
//
// TODO: Move this type out of this package after go 1.18 supports a generic
// maybe type.
type JSONTime time.Time

// MarshalJSON converts the value to json.
func (t JSONTime) MarshalJSON() ([]byte, error) {
	ti := time.Time(t)
	return json.Marshal(ti.UTC().Format(timeFormat))
}

// UnmarshalJSON converts the time from json.
func (t *JSONTime) UnmarshalJSON(bs []byte) error {
	var v string
	if err := json.Unmarshal(bs, &v); err != nil {
		return fmt.Errorf("unmarshaling value: %w", err)
	}

	ti, err := time.Parse(timeFormat, v)
	if err != nil {
		return fmt.Errorf("parsing time: %w", err)
	}

	*t = JSONTime(ti)
	return nil
}

// Time is a string or null.
type Time struct {
	value JSONTime
	set   bool
}

// NewTime create a new maybe.Time with a value.
//
// To create a null-maybe.Time, just use the zero-value.
func NewTime(value JSONTime) Time {
	return Time{value: value, set: true}
}

// Value returns the value and with the second return argument, if the value is
// set.
func (m Time) Value() (JSONTime, bool) {
	if m.set {
		return m.value, true
	}
	return JSONTime{}, false
}

// MarshalJSON encodes the value from json.
func (m Time) MarshalJSON() ([]byte, error) {
	v, ok := m.Value()
	if !ok {
		return []byte("null"), nil
	}
	return json.Marshal(v)
}

// UnmarshalJSON decodes the value from json.
func (m *Time) UnmarshalJSON(bs []byte) error {
	if string(bs) == "null" {
		m.value = JSONTime{}
		m.set = false
		return nil
	}

	if err := json.Unmarshal(bs, &m.value); err != nil {
		return fmt.Errorf("unmarshaling value: %w", err)
	}
	m.set = true
	return nil
}

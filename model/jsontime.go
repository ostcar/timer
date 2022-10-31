package model

import (
	"encoding/json"
	"fmt"
	"time"
)

const timeFormat = "2006-01-02 15:04:05"

// JSONTime is a time type with a consum marshaling to json.
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

// JSONDuration is a duration type with a consum marshaling to json.
type JSONDuration time.Duration

// MarshalJSON converts the value to json.
func (d JSONDuration) MarshalJSON() ([]byte, error) {
	return json.Marshal(time.Duration(d).String())
}

// UnmarshalJSON converts the time from json.
func (d *JSONDuration) UnmarshalJSON(bs []byte) error {
	var v string
	if err := json.Unmarshal(bs, &v); err != nil {
		return fmt.Errorf("unmarshaling value: %w", err)
	}

	du, err := time.ParseDuration(v)
	if err != nil {
		return fmt.Errorf("parsing duration: %w", err)
	}

	*d = JSONDuration(du)
	return nil
}

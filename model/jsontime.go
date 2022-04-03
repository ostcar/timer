package model

import (
	"encoding/json"
	"fmt"
	"time"
)

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

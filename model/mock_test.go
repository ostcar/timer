package model

import (
	"time"
)

type testEvent struct {
	Content string `json:"content"`
}

func (e testEvent) Validate(db Model) error {
	return nil
}
func (e testEvent) Execute(m Model, _ time.Time) Model {
	return m

}
func (e testEvent) Name() string {
	return "test"
}

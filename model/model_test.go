package model

import (
	"strings"
	"testing"
)

func TestModelLoad(t *testing.T) {
	events := `
	{"type":"start","time":"2022-01-02 15:16:00","payload":{"comment":"lets go"}}
	{"type":"stop","time":"2022-01-02 15:20:00","payload":{"id":1}}
	{"type":"start","time":"2022-01-02 15:30:00","payload":{"comment":"here again"}}
	{"type":"stop","time":"2022-01-02 15:40:00","payload":{"id":2,"comment":"here again!"}}
	{"type":"edit","time":"2022-01-02 15:45:00","payload":{"id":1,"comment":"lets go!"}}
	`

	m, err := loadDatabase(strings.NewReader(events))
	if err != nil {
		t.Fatalf("loadDatabase returned: %v", err)
	}

	if !m.current.start.IsZero() {
		t.Errorf("time is currently running. Expected no current value")
	}

	if got := len(m.periodes); got != 2 {
		t.Errorf("there are %d periodes, expected 2", got)
	}

	if got, _ := m.periodes[1].Comment.Value(); got != "lets go" {
		t.Errorf("got first comment %q, expected `lets go!`", got)
	}

	if got, _ := m.periodes[2].Comment.Value(); got != "here again!" {
		t.Errorf("got second comment %q, expected `here again!`", got)
	}
}

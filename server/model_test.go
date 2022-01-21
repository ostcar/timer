package server

import (
	"strings"
	"testing"
)

func TestModelLoad(t *testing.T) {
	events := `
	{"type":"start","time":"2022-01-02 15:16:00","payload":{"comment":"lets go"}}
	{"type":"stop","time":"2022-01-02 15:20:00","payload":{}}
	{"type":"start","time":"2022-01-02 15:30:00","payload":{"comment":"here again"}}
	{"type":"stop","time":"2022-01-02 15:40:00","payload":{"comment":"here again!"}}
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

	if got := m.periodes[1].comment; got != "lets go" {
		t.Errorf("got first comment %q, expected `lets go`", got)
	}

	if got := m.periodes[2].comment; got != "here again!" {
		t.Errorf("got second comment %q, expected `here again!`", got)
	}
}

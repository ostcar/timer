package model

import (
	"strings"
	"testing"
	"time"
)

func TestModelLoad(t *testing.T) {
	db := newMemoryDB(`
	{"type":"start","time":"2022-01-02 15:16:00","payload":{"comment":"lets go"}}
	{"type":"stop","time":"2022-01-02 15:20:00","payload":{"id":1}}
	{"type":"start","time":"2022-01-02 15:30:00","payload":{"comment":"here again"}}
	{"type":"stop","time":"2022-01-02 15:40:00","payload":{"id":2,"comment":"here again!"}}
	{"type":"edit","time":"2022-01-02 15:45:00","payload":{"id":1,"comment":"lets go!"}}
	`)

	m, err := New(db)
	if err != nil {
		t.Fatalf("loadDatabase: %v", err)
	}

	if !m.current.start.IsZero() {
		t.Errorf("time is currently running. Expected no current value")
	}

	if got := len(m.periodes); got != 2 {
		t.Errorf("there are %d periodes, expected 2", got)
	}

	if got, _ := m.periodes[1].Comment.Value(); got != "lets go!" {
		t.Errorf("got first comment `%s`, expected `lets go!`", got)
	}

	if got, _ := m.periodes[2].Comment.Value(); got != "here again!" {
		t.Errorf("got second comment `%s`, expected `here again!`", got)
	}
}

func TestModelWriteEvent(t *testing.T) {
	db := newMemoryDB("")

	m, err := New(db)
	if err != nil {
		t.Fatalf("loadDatabase: %v", err)
	}

	m.now = func() time.Time { return time.Time{} }

	te := testEvent{"some content"}

	if err := m.writeEvent(te); err != nil {
		t.Fatalf("write Event: %v", err)
	}

	expect := `{"time":"0001-01-01 00:00:00","type":"test","payload":{"content":"some content"}}`
	if strings.TrimSpace(db.content) != expect {
		t.Errorf("got `%v`, expect `%v`", db.content, expect)
	}

}

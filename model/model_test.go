package model

import (
	"strings"
	"testing"
	"time"

	"github.com/ostcar/timer/sticky"
)

func TestModelLoad(t *testing.T) {
	db := sticky.NewMemoryDB(`
	{"type":"start","time":"2022-01-02 15:16:00","payload":{"comment":"lets go"}}
	{"type":"stop","time":"2022-01-02 15:20:00","payload":{"id":1}}
	{"type":"start","time":"2022-01-02 15:30:00","payload":{"comment":"here again"}}
	{"type":"stop","time":"2022-01-02 15:40:00","payload":{"id":2,"comment":"here again!"}}
	{"type":"edit","time":"2022-01-02 15:45:00","payload":{"id":1,"comment":"lets go!"}}

	{"type":"insertV2","time":"2022-01-02 15:45:00","payload":{"id":3,"start":"2022-01-02 15:45:00","duration":"5m","comment":"added"}}
	{"type":"editV2","time":"2022-01-02 15:45:00","payload":{"id":3,"duration":"3m"}}
	`)

	s, err := sticky.New(db, GetEvent)
	if err != nil {
		t.Fatalf("loadDatabase: %v", err)
	}

	s.Read(func(m Model) {
		if !m.current.start.IsZero() {
			t.Errorf("time is currently running. Expected no current value")
		}

		if got := len(m.periodes); got != 3 {
			t.Errorf("there are %d periodes, expected 3", got)
		}

		if got, _ := m.periodes[1].Comment.Value(); got != "lets go!" {
			t.Errorf("got first comment `%s`, expected `lets go!`", got)
		}

		if got, _ := m.periodes[2].Comment.Value(); got != "here again!" {
			t.Errorf("got second comment `%s`, expected `here again!`", got)
		}

		if got, _ := m.periodes[3].Comment.Value(); got != "added" {
			t.Errorf("got third comment `%s`, expected `added`", got)
		}

		if got := m.periodes[3].Duration; got != 3*time.Minute {
			t.Errorf("got third duration `%v`, expected 3 minutes", got)
		}
	})
}

func TestModelWriteEvent(t *testing.T) {
	db := sticky.NewMemoryDB("")
	now := func() time.Time { return time.Time{} }

	s, err := sticky.New(db, GetEvent, sticky.WithNow[Model](now))
	if err != nil {
		t.Fatalf("loadDatabase: %v", err)
	}

	err = s.Write(func(m Model) sticky.Event[Model] {
		return testEvent{"some content"}
	})

	if err != nil {
		t.Fatalf("Write: %v", err)
	}

	expect := `{"time":"0001-01-01 00:00:00","type":"test","payload":{"content":"some content"}}`
	if strings.TrimSpace(db.Content) != expect {
		t.Errorf("got `%v`, expect `%v`", db.Content, expect)
	}

}

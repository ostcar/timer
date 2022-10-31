package model

import (
	"fmt"
	"io"
	"strings"
	"time"
)

type memoryDB struct {
	content string
}

func newMemoryDB(content string) *memoryDB {
	return &memoryDB{content}
}

func (db *memoryDB) Reader() (io.ReadCloser, error) {
	return io.NopCloser(strings.NewReader(db.content)), nil
}

func (db *memoryDB) Append(bs []byte) error {
	db.content += fmt.Sprintf("%s\n", bs)
	return nil
}

type testEvent struct {
	Content string `json:"content"`
}

func (e testEvent) validate(db *Model) error {
	return nil
}
func (e testEvent) execute(db *Model, time time.Time) error {
	return nil

}
func (e testEvent) Name() string {
	return "test"
}

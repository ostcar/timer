package sticky

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"os"
	"strings"
)

// FileDB is a evet database based of one file.
type FileDB struct {
	File string
}

// Reader opens the file and returns its reader.
func (db FileDB) Reader() (io.ReadCloser, error) {
	f, err := os.Open(db.File)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return io.NopCloser(strings.NewReader("")), nil
		}
		return nil, fmt.Errorf("open database file: %w", err)
	}
	return f, nil
}

// Append adds data to the file with a newline.
func (db FileDB) Append(bs []byte) error {
	if bytes.Contains(bs, []byte("\n")) {
		return errors.New("event contains a newline")
	}

	f, err := os.OpenFile(db.File, os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0600)
	if err != nil {
		return fmt.Errorf("open db file: %w", err)
	}
	defer func() {
		wErr := f.Close()
		if err != nil {
			err = wErr
		}
	}()

	if _, err := fmt.Fprintf(f, "%s\n", bs); err != nil {
		return fmt.Errorf("writing event to file: %q: %w", bs, err)
	}

	return nil
}

// MemoryDB stores Events in memory.
//
// Usefull for testing.
type MemoryDB struct {
	Content string
}

// NewMemoryDB initializes a MemoryDB
func NewMemoryDB(content string) *MemoryDB {
	return &MemoryDB{content}
}

// Reader reads the content.
func (db *MemoryDB) Reader() (io.ReadCloser, error) {
	return io.NopCloser(strings.NewReader(db.Content)), nil
}

// Append adds a new event.
func (db *MemoryDB) Append(bs []byte) error {
	db.Content += fmt.Sprintf("%s\n", bs)
	return nil
}

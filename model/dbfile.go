package model

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"os"
	"strings"
)

// fileDB is a evet database based of one file.
type fileDB struct {
	file string
}

func (db fileDB) Reader() (io.ReadCloser, error) {
	f, err := os.Open(db.file)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return io.NopCloser(strings.NewReader("")), nil
		}
		return nil, fmt.Errorf("open database file: %w", err)
	}
	return f, nil
}

func (db fileDB) Append(bs []byte) error {
	if bytes.Contains(bs, []byte("\n")) {
		return errors.New("event contains a newline")
	}

	f, err := os.OpenFile(db.file, os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0600)
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

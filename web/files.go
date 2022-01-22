package web

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
)

// DefaultFiles that are used, when the folders do not exist in the file system.
type DefaultFiles struct {
	Index  []byte
	Elm    []byte
	Static fs.FS
}

// MultiFS implements fs.FS but uses many sources.
type MultiFS struct {
	fs []fs.FS
}

// Open opens the file from the first source that contains it.
func (fs MultiFS) Open(name string) (fs.File, error) {
	for i, fs := range fs.fs {
		f, err := fs.Open(name)
		if err != nil {
			if !errors.Is(err, os.ErrNotExist) {
				return nil, fmt.Errorf("try open file from source %d: %w", i, err)
			}
			continue
		}
		return f, nil
	}
	return nil, os.ErrNotExist
}

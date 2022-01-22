package web

import "io/fs"

// DefaultFiles that are used, when the folders do not exist in the file system.
type DefaultFiles struct {
	Index  []byte
	Elm    []byte
	Static fs.FS
}

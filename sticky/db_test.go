package sticky

import (
	"io"
	"os"
	"path"
	"testing"
)

func TestDBFile_read_empty_does_nothing(t *testing.T) {
	tmpdir := t.TempDir()

	db := FileDB{path.Join(tmpdir, "file.db")}

	dbReader, err := db.Reader()
	if err != nil {
		t.Fatalf("getting db reader: %v", err)
	}
	defer dbReader.Close()

	got, err := io.ReadAll(dbReader)
	if err != nil {
		t.Fatalf("Reading db: %v", err)
	}

	if len(got) != 0 {
		t.Errorf("got `%s`from empty db. Expected nothing", got)
	}

	files, err := os.ReadDir(tmpdir)
	if err != nil {
		t.Fatalf("reading temp dir: %v", err)
	}

	if len(files) != 0 {
		t.Errorf("read created files %v", files)
	}
}

func TestDBFile_read_existing_file_returns_its_content(t *testing.T) {
	tmpdir := t.TempDir()

	if err := os.WriteFile(path.Join(tmpdir, "file.db"), []byte("some content"), 0666); err != nil {
		t.Fatalf("writing file: %v", err)
	}

	db := FileDB{path.Join(tmpdir, "file.db")}

	dbReader, err := db.Reader()
	if err != nil {
		t.Fatalf("getting db reader: %v", err)
	}
	defer dbReader.Close()

	got, err := io.ReadAll(dbReader)
	if err != nil {
		t.Fatalf("Reading db: %v", err)
	}

	if string(got) != "some content" {
		t.Errorf("got %s, expected `some content`", got)
	}
}

func TestDBFile_append_on_empty_db_creates_file_with_newline_at_end(t *testing.T) {
	tmpdir := t.TempDir()

	db := FileDB{path.Join(tmpdir, "file.db")}

	if err := db.Append([]byte("some string without newline")); err != nil {
		t.Fatalf("append to db: %v", err)
	}

	got, err := os.ReadFile(path.Join(tmpdir, "file.db"))
	if err != nil {
		t.Fatalf("reading file: %v", err)
	}

	expect := "some string without newline\n"
	if string(got) != expect {
		t.Errorf("got `%s`, expected `%s`", got, expect)
	}
}

func TestDBFile_append_new_line_creates_an_error(t *testing.T) {
	tmpdir := t.TempDir()

	db := FileDB{path.Join(tmpdir, "file.db")}

	if err := db.Append([]byte("some string\nwith newline")); err == nil {
		t.Errorf("append an newline did not return an error")
	}
}

func TestDBFile_append_on_existing_file_appends(t *testing.T) {
	tmpdir := t.TempDir()

	if err := os.WriteFile(path.Join(tmpdir, "file.db"), []byte("some content\n"), 0666); err != nil {
		t.Fatalf("writing file: %v", err)
	}

	db := FileDB{path.Join(tmpdir, "file.db")}

	if err := db.Append([]byte("some string")); err != nil {
		t.Fatalf("append to db: %v", err)
	}

	got, err := os.ReadFile(path.Join(tmpdir, "file.db"))
	if err != nil {
		t.Fatalf("reading file: %v", err)
	}

	expect := "some content\nsome string\n"
	if string(got) != expect {
		t.Errorf("got `%s`, expected `%s`", got, expect)
	}
}

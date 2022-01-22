package web

import (
	"encoding/json"
	"errors"
	"io/fs"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/mux"
	"github.com/ostcar/timer/maybe"
	"github.com/ostcar/timer/model"
)

const (
	pathPrefixAPI    = "/api"
	pathPrefixStatic = "/static"
)

func registerHandlers(router *mux.Router, model *model.Model, defaultFiles DefaultFiles) {
	fileSystem := MultiFS{
		fs: []fs.FS{
			os.DirFS("./static"),
			defaultFiles.Static,
		},
	}

	router.Use(loggingMiddleware)

	handleElmJS(router, defaultFiles.Elm)
	handleIndex(router, defaultFiles.Index)
	handleStatic(router, fileSystem)

	handleList(router, model)
}

type responselogger struct {
	http.ResponseWriter
	code int
}

func (r *responselogger) WriteHeader(h int) {
	r.code = h
	r.ResponseWriter.WriteHeader(h)
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writer := responselogger{w, 200}
		next.ServeHTTP(w, r)
		log.Printf("%s %d %s", r.Method, writer.code, r.RequestURI)
	})
}

// handleIndex returns the index.html. It is returned from all urls exept /api
// and /static.
//
// If the file exists in client/index.html, it is used. In other case the
// default index.html, is used.
func handleIndex(router *mux.Router, defaultContent []byte) {
	handler := func(w http.ResponseWriter, r *http.Request) {
		bs, err := os.ReadFile("client/index.html")
		if err != nil {
			if !errors.Is(err, os.ErrNotExist) {
				log.Println(err)
				http.Error(w, "Internal", 500)
				return
			}
			bs = defaultContent
		}
		w.Write(bs)
	}

	router.MatcherFunc(func(r *http.Request, m *mux.RouteMatch) bool {
		// Match every path expect /api and /static
		return !strings.HasPrefix(r.URL.Path, pathPrefixAPI) && !strings.HasPrefix(r.URL.Path, pathPrefixStatic)
	}).HandlerFunc(handler)
}

// handleElmJS returns the elm-js file.
//
// If the file exists in client/elm.js, it is used. In other case the default
// file, bundeled with the executable is used.
func handleElmJS(router *mux.Router, defaultContent []byte) {
	handler := func(w http.ResponseWriter, r *http.Request) {
		bs, err := os.ReadFile("client/elm.js")
		if err != nil {
			if !errors.Is(err, os.ErrNotExist) {
				log.Println(err)
				http.Error(w, "Internal", 500)
				return
			}
			bs = defaultContent
		}
		w.Write(bs)
	}
	router.Path("/elm.js").HandlerFunc(handler)
}

// handleStatic returns static files.
//
// It looks for each file in a directory "static/". It the file does not exist
// there, it looks in the default static files, the binary was creaded with.
func handleStatic(router *mux.Router, fileSystem fs.FS) {
	router.PathPrefix(pathPrefixStatic).Handler(http.StripPrefix(pathPrefixStatic, http.FileServer(http.FS(fileSystem))))
}

func handleList(router *mux.Router, model *model.Model) {
	type periode struct {
		ID      int          `json:"id"`
		Start   int64        `json:"start"`
		Stop    int64        `json:"stop"`
		Comment maybe.String `json:"comment"`
	}

	handler := func(w http.ResponseWriter, r *http.Request) {
		modelPeriodes := model.List()
		outPeriodes := make([]periode, len(modelPeriodes))
		for i, p := range modelPeriodes {
			outPeriodes[i] = periode{
				ID:      p.ID,
				Start:   p.Start.Unix(),
				Stop:    p.Stop.Unix(),
				Comment: p.Comment,
			}
		}

		start, comment, isRunning := model.Running()

		data := struct {
			Running  bool         `json:"running"`
			Start    int64        `json:"start"`
			Comment  maybe.String `json:"comment"`
			Periodes []periode    `json:"periodes"`
		}{
			isRunning,
			start.Unix(),
			comment,
			outPeriodes,
		}

		if err := json.NewEncoder(w).Encode(data); err != nil {
			log.Println(err)
			http.Error(w, "Internal", 500)
		}
	}

	router.Path(pathPrefixAPI + "/periode").Methods("GET").HandlerFunc(handler)
}

package web

import (
	"encoding/json"
	"errors"
	"io/fs"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

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
	handleStart(router, model)
	handleStop(router, model)

	handlePeriode(router, model)
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
				handleError(w, err)
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
				handleError(w, err)
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

func handlePeriode(router *mux.Router, model *model.Model) {
	pathList := pathPrefixAPI + "/periode"
	pathSingle := pathList + "/{id}"

	type periode struct {
		ID      int          `json:"id"`
		Start   int64        `json:"start"`
		Stop    int64        `json:"stop"`
		Comment maybe.String `json:"comment"`
	}

	// List Handler
	router.Path(pathList).Methods("GET").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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
			handleError(w, err)
			return
		}
	})

	// Create Handler
	router.Path(pathList).Methods("POST").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var content struct {
			Start   int64        `json:"start"`
			Stop    int64        `json:"stop"`
			Content maybe.String `json:"content"`
		}

		if err := json.NewDecoder(r.Body).Decode(&content); err != nil {
			handleError(w, err)
			return
		}

		id, err := model.Insert(time.Unix(content.Start, 0), time.Unix(content.Stop, 0), content.Content)
		if err != nil {
			handleError(w, err)
			return
		}

		response := struct {
			ID int `json:"id"`
		}{
			ID: id,
		}
		if err := json.NewEncoder(w).Encode(response); err != nil {
			handleError(w, err)
			return
		}
	})

	// Edit Handler
	router.Path(pathSingle).Methods("PUT").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id, _ := strconv.Atoi(mux.Vars(r)["id"])

		var content struct {
			Start   maybe.Int64  `json:"start"`
			Stop    maybe.Int64  `json:"stop"`
			Content maybe.String `json:"content"`
		}

		if err := json.NewDecoder(r.Body).Decode(&content); err != nil {
			handleError(w, err)
			return
		}

		start := maybe.Time{}
		if v, ok := content.Start.Value(); ok {
			start = maybe.NewTime(time.Unix(v, 0))
		}

		stop := maybe.Time{}
		if v, ok := content.Stop.Value(); ok {
			stop = maybe.NewTime(time.Unix(v, 0))
		}

		if err := model.Edit(id, start, stop, content.Content); err != nil {
			handleError(w, err)
			return
		}
	})

	// Delete Handler
	router.Path(pathSingle).Methods("DELETE").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id, _ := strconv.Atoi(mux.Vars(r)["id"])

		if err := model.Delete(id); err != nil {
			handleError(w, err)
			return
		}
	})
}

func handleStart(router *mux.Router, model *model.Model) {
	handler := func(w http.ResponseWriter, r *http.Request) {
		var content struct {
			Comment maybe.String `json:"comment"`
		}
		if err := json.NewDecoder(r.Body).Decode(&content); err != nil {
			handleError(w, err)
			return
		}

		if err := model.Start(content.Comment); err != nil {
			handleError(w, err)
			return
		}
	}

	router.Path(pathPrefixAPI + "/start").Methods("POST").HandlerFunc(handler)
}

func handleStop(router *mux.Router, model *model.Model) {
	handler := func(w http.ResponseWriter, r *http.Request) {
		var content struct {
			Comment maybe.String `json:"comment"`
		}
		if err := json.NewDecoder(r.Body).Decode(&content); err != nil {
			handleError(w, err)
			return
		}

		id, err := model.Stop(content.Comment)
		if err != nil {
			handleError(w, err)
			return
		}

		response := struct {
			ID int `json:"id"`
		}{
			ID: id,
		}
		if err := json.NewEncoder(w).Encode(response); err != nil {
			handleError(w, err)
			return
		}
	}

	router.Path(pathPrefixAPI + "/stop").Methods("POST").HandlerFunc(handler)
}

func handleError(w http.ResponseWriter, err error) {
	msg := "Interner Fehler"
	status := 500
	var skipLog bool

	var forClient interface {
		forClient() string
	}
	if errors.As(err, &forClient) {
		msg = forClient.forClient()
		status = 400
		//skipLog = true
	}

	var httpStatus interface {
		httpStatus() int
	}
	if errors.As(err, &httpStatus) {
		status = httpStatus.httpStatus()
	}

	if !skipLog {
		log.Printf("Error: %v", err)
	}

	http.Error(w, msg, status)
	return
}

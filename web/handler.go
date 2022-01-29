package web

import (
	"crypto/subtle"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/ostcar/timer/config"
	"github.com/ostcar/timer/maybe"
	"github.com/ostcar/timer/model"
)

const (
	pathPrefixAPI    = "/api"
	pathPrefixStatic = "/static"
	cookieName       = "timer"
	cookieAge        = 265 * 24 * time.Hour
)

func registerHandlers(router *mux.Router, model *model.Model, cfg config.Config, defaultFiles DefaultFiles) {
	fileSystem := MultiFS{
		fs: []fs.FS{
			os.DirFS("./web/static"),
			defaultFiles.Static,
		},
	}

	router.Use(loggingMiddleware)

	handleElmJS(router, defaultFiles.Elm)
	handleIndex(router, defaultFiles.Index)
	handleStatic(router, fileSystem)
	handleAuth(router, cfg)

	handleStart(router, model, cfg)
	handleStop(router, model, cfg)
	handlePeriode(router, model, cfg)
}

type responselogger struct {
	http.ResponseWriter
	code int
}

func (r *responselogger) WriteHeader(code int) {
	r.code = code
	r.ResponseWriter.WriteHeader(code)
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writer := &responselogger{w, 200}
		next.ServeHTTP(writer, r)
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
		bs, err := os.ReadFile("web/client/index.html")
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
		bs, err := os.ReadFile("web/client/elm.js")
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

func handleAuth(router *mux.Router, cfg config.Config) {
	router.Path(pathPrefixAPI + "/auth").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var content struct {
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&content); err != nil {
			handleError(w, err)
			return
		}

		var level string
		if subtle.ConstantTimeCompare([]byte(content.Password), []byte(cfg.PasswordWrite)) == 1 {
			level = "write"
		}

		if subtle.ConstantTimeCompare([]byte(content.Password), []byte(cfg.PasswordRead)) == 1 {
			level = "read"
		}

		if level == "" {
			w.WriteHeader(401)
			fmt.Fprintf(w, "Invalid password")
			return
		}

		tokenString, err := createToken(level, []byte(cfg.Secred))
		if err != nil {
			handleError(w, err)
			return
		}

		http.SetCookie(w, &http.Cookie{Name: cookieName, Value: tokenString, Path: "/", Secure: true})
		fmt.Fprintln(w, level)
	})

	router.Path(pathPrefixAPI + "/auth/logout").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.SetCookie(w, &http.Cookie{Name: cookieName, Value: "", Path: "/", MaxAge: int(cookieAge.Seconds()), Secure: true})
	})
}

func handlePeriode(router *mux.Router, model *model.Model, cfg config.Config) {
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
		if !canRead(r, cfg) {
			w.WriteHeader(403)
			return
		}

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
		if !canWrite(r, cfg) {
			w.WriteHeader(403)
			return
		}

		var content struct {
			Start   int64        `json:"start"`
			Stop    int64        `json:"stop"`
			Content maybe.String `json:"comment"`
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
		if !canWrite(r, cfg) {
			w.WriteHeader(403)
			return
		}

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
			start = maybe.NewTime(maybe.JSONTime(time.Unix(v, 0)))
		}

		stop := maybe.Time{}
		if v, ok := content.Stop.Value(); ok {
			stop = maybe.NewTime(maybe.JSONTime(time.Unix(v, 0)))
		}

		if err := model.Edit(id, start, stop, content.Content); err != nil {
			handleError(w, err)
			return
		}
	})

	// Delete Handler
	router.Path(pathSingle).Methods("DELETE").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !canWrite(r, cfg) {
			w.WriteHeader(403)
			return
		}

		id, _ := strconv.Atoi(mux.Vars(r)["id"])

		if err := model.Delete(id); err != nil {
			handleError(w, err)
			return
		}
	})
}

func handleStart(router *mux.Router, model *model.Model, cfg config.Config) {
	handler := func(w http.ResponseWriter, r *http.Request) {
		if !canWrite(r, cfg) {
			w.WriteHeader(403)
			return
		}

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

func handleStop(router *mux.Router, model *model.Model, cfg config.Config) {
	handler := func(w http.ResponseWriter, r *http.Request) {
		if !canWrite(r, cfg) {
			w.WriteHeader(403)
			return
		}

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

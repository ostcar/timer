package web

import (
	"crypto/subtle"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/ostcar/timer/config"
	"github.com/ostcar/timer/model"
	"github.com/ostcar/timer/sticky"
)

const (
	pathPrefixAPI    = "/api"
	pathPrefixStatic = "/static"
	cookieName       = "timer"
	cookieAge        = 265 * 24 * time.Hour
)

// Files to use in the handlers.
type Files struct {
	Index  []byte
	Elm    []byte
	Static fs.FS
}

func registerHandlers(router *mux.Router, s *sticky.Sticky[model.Model], cfg config.Config, files Files) {
	router.Use(loggingMiddleware)

	handleElmJS(router, files.Elm)
	handleIndex(router, files.Index)
	handleStatic(router, files.Static)
	handleAuth(router, cfg)

	handleStart(router, s, cfg)
	handleStop(router, s, cfg)
	handlePeriode(router, s, cfg)
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
func handleIndex(router *mux.Router, content []byte) {
	handler := func(w http.ResponseWriter, r *http.Request) {
		w.Write(content)
	}

	router.MatcherFunc(func(r *http.Request, m *mux.RouteMatch) bool {
		// Match every path expect /api and /static
		return !strings.HasPrefix(r.URL.Path, pathPrefixAPI) && !strings.HasPrefix(r.URL.Path, pathPrefixStatic)
	}).HandlerFunc(handler)
}

// handleElmJS returns the elm-js file.
func handleElmJS(router *mux.Router, content []byte) {
	handler := func(w http.ResponseWriter, r *http.Request) {
		w.Write(content)
	}

	router.Path("/elm.js").HandlerFunc(handler)
}

// handleStatic returns static files.
func handleStatic(router *mux.Router, fileSystem fs.FS) {
	router.PathPrefix(pathPrefixStatic).Handler(
		http.StripPrefix(pathPrefixStatic, http.FileServer(http.FS(fileSystem))),
	)
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

		http.SetCookie(w, &http.Cookie{Name: cookieName, Value: tokenString, Path: "/", MaxAge: int(cookieAge.Seconds()), Secure: true})
		fmt.Fprintln(w, level)
	})

	router.Path(pathPrefixAPI + "/auth/logout").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.SetCookie(w, &http.Cookie{Name: cookieName, Value: "", Path: "/", MaxAge: -1, Secure: true})
	})
}

func handlePeriode(router *mux.Router, s *sticky.Sticky[model.Model], cfg config.Config) {
	pathList := pathPrefixAPI + "/periode"
	pathSingle := pathList + "/{id}"

	type periode struct {
		ID       int                 `json:"id"`
		Start    int64               `json:"start"`
		Duration int64               `json:"duration"`
		Comment  model.Maybe[string] `json:"comment"`
	}

	// List Handler
	router.Path(pathList).Methods("GET").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !canRead(r, cfg) {
			w.WriteHeader(403)
			return
		}

		s.Read(func(m model.Model) {
			modelPeriodes := m.List()

			outPeriodes := make([]periode, len(modelPeriodes))
			for i, p := range modelPeriodes {
				outPeriodes[i] = periode{
					ID:       p.ID,
					Start:    p.Start.Unix(),
					Duration: int64(p.Duration.Seconds()),
					Comment:  p.Comment,
				}
			}

			start, comment, isRunning := m.Running()

			data := struct {
				Running  bool                `json:"running"`
				Start    int64               `json:"start"`
				Comment  model.Maybe[string] `json:"comment"`
				Periodes []periode           `json:"periodes"`
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
	})

	// Create Handler
	router.Path(pathList).Methods("POST").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !canWrite(r, cfg) {
			w.WriteHeader(403)
			return
		}

		var content struct {
			Start    int64               `json:"start"`
			Duration int64               `json:"duration"`
			Comment  model.Maybe[string] `json:"comment"`
		}

		if err := json.NewDecoder(r.Body).Decode(&content); err != nil {
			handleError(w, err)
			return
		}

		var id int
		err := s.Write(func(m model.Model) sticky.Event[model.Model] {
			newID, event := m.Insert(time.Unix(content.Start, 0), time.Duration(content.Duration)*time.Second, content.Comment)
			id = newID
			return event
		})
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
			Start    model.Maybe[int64]  `json:"start"`
			Duration model.Maybe[int64]  `json:"duration"`
			Comment  model.Maybe[string] `json:"comment"`
		}

		if err := json.NewDecoder(r.Body).Decode(&content); err != nil {
			handleError(w, err)
			return
		}

		var start model.Maybe[sticky.JSONTime]
		if v, ok := content.Start.Value(); ok {
			start = model.Just(sticky.JSONTime(time.Unix(v, 0)))
		}

		var duration model.Maybe[sticky.JSONDuration]
		if v, ok := content.Duration.Value(); ok {
			duration = model.Just(sticky.JSONDuration(time.Duration(v) * time.Second))
		}

		err := s.Write(func(m model.Model) sticky.Event[model.Model] {
			return m.Edit(id, start, duration, content.Comment)
		})
		if err != nil {
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

		err := s.Write(func(m model.Model) sticky.Event[model.Model] {
			return m.Delete(id)
		})
		if err != nil {
			handleError(w, err)
			return
		}
	})
}

func handleStart(router *mux.Router, s *sticky.Sticky[model.Model], cfg config.Config) {
	handler := func(w http.ResponseWriter, r *http.Request) {
		if !canWrite(r, cfg) {
			w.WriteHeader(403)
			return
		}

		var content struct {
			Comment model.Maybe[string] `json:"comment"`
		}
		if err := json.NewDecoder(r.Body).Decode(&content); err != nil {
			handleError(w, err)
			return
		}

		err := s.Write(func(m model.Model) sticky.Event[model.Model] {
			return m.Start(content.Comment)
		})
		if err != nil {
			handleError(w, err)
			return
		}
	}

	router.Path(pathPrefixAPI + "/start").Methods("POST").HandlerFunc(handler)
}

func handleStop(router *mux.Router, s *sticky.Sticky[model.Model], cfg config.Config) {
	handler := func(w http.ResponseWriter, r *http.Request) {
		if !canWrite(r, cfg) {
			w.WriteHeader(403)
			return
		}

		var content struct {
			Comment model.Maybe[string] `json:"comment"`
		}
		if err := json.NewDecoder(r.Body).Decode(&content); err != nil {
			handleError(w, err)
			return
		}

		var id int
		err := s.Write(func(m model.Model) sticky.Event[model.Model] {
			stopID, event := m.Stop(content.Comment)
			id = stopID
			return event
		})
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

	var errValidation sticky.ValidationError
	if errors.As(err, &errValidation) {
		msg = errValidation.Error()
		status = 400
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

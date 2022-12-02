package sticky

import "time"

// Option is a option for sticky.New()
type Option[Model any] func(s *Sticky[Model])

// WithNow uses a special now function. Default is time.Now()
func WithNow[Model any](now func() time.Time) Option[Model] {
	return func(s *Sticky[Model]) {
		s.now = now
	}
}

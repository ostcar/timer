package maybe_test

import (
	"encoding/json"
	"testing"

	"github.com/ostcar/timer/maybe"
)

func TestStringJSON(t *testing.T) {
	for _, ms := range []maybe.String{
		{},
		maybe.NewString("foobar"),
	} {
		bs, err := json.Marshal(ms)
		if err != nil {
			t.Fatalf("encoding value: %v", err)
		}

		var decoded maybe.String
		if err := json.Unmarshal(bs, &decoded); err != nil {
			t.Fatalf("decding value: %v", err)
		}

		if ms != decoded {
			t.Errorf("value is not the same after marshal. Got %v, expected %v", decoded, ms)
		}
	}
}

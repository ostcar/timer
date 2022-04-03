package model_test

import (
	"encoding/json"
	"testing"

	"github.com/ostcar/timer/model"
)

func TestStringJSON(t *testing.T) {
	ms := model.Just("foobar")
	bs, err := json.Marshal(ms)
	if err != nil {
		t.Fatalf("encoding value: %v", err)
	}

	var decoded model.Maybe[string]
	if err := json.Unmarshal(bs, &decoded); err != nil {
		t.Fatalf("decding value: %v", err)
	}

	if ms != decoded {
		t.Errorf("value is not the same after marshal. Got %v, expected %v", decoded, ms)
	}
}

package config

import (
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/pelletier/go-toml/v2"
)

// Config holds all settings to start the server
type Config struct {
	WebListenAddr  string `toml:"web_listen_addr"`
	GRPCListenAddr string `toml:"grpc_listen_addr"`
}

// DefaultConfig returns a config object with default values.
func DefaultConfig() Config {
	return Config{
		WebListenAddr:  ":8080",
		GRPCListenAddr: ":4040",
	}
}

// LoadConfig loads the config from a toml file.
func LoadConfig(file string) (Config, error) {
	c := DefaultConfig()

	f, err := os.Open(file)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			log.Println("Warning: No config file. Use default settings")
			return c, nil
		}
		return Config{}, fmt.Errorf("open config file: %w", err)
	}

	if err := toml.NewDecoder(f).Decode(&c); err != nil {
		return Config{}, fmt.Errorf("reading config: %w", err)
	}
	return c, nil
}

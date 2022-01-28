package web

import (
	"fmt"
	"log"
	"net/http"

	"github.com/golang-jwt/jwt/v4"
	"github.com/ostcar/timer/config"
)

type authPayload struct {
	jwt.StandardClaims
	Level string `json:"level"`
}

func createToken(level string, secred []byte) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, authPayload{Level: level})

	tokenString, err := token.SignedString(secred)
	if err != nil {
		return "", fmt.Errorf("signing token: %w", err)
	}

	return tokenString, nil
}

func checkClaim(tokenString string, secred []byte, levels []string) (bool, error) {
	var claim authPayload

	_, err := jwt.ParseWithClaims(tokenString, &claim, func(token *jwt.Token) (interface{}, error) {
		return secred, nil
	})
	if err != nil {
		return false, fmt.Errorf("parsing token: %w", err)
	}

	for _, level := range levels {
		if claim.Level == level {
			return true, nil
		}
	}
	return false, nil
}

func canRead(r *http.Request, cfg config.Config) bool {
	c, err := r.Cookie(cookieName)
	if err != nil {
		return false
	}

	v, _ := checkClaim(c.Value, []byte(cfg.Secred), []string{"read", "write"})
	return v
}

func canWrite(r *http.Request, cfg config.Config) bool {
	c, err := r.Cookie(cookieName)
	if err != nil {
		log.Println(err)
		return false
	}

	v, err := checkClaim(c.Value, []byte(cfg.Secred), []string{"write"})
	if err != nil {
		log.Println(err)
	}
	return v
}

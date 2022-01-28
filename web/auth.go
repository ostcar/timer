package web

import (
	"fmt"

	"github.com/golang-jwt/jwt/v4"
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
		return claim.Level == level, nil
	}
	return false, nil
}

package utils

import (
	"fmt"
	"math/rand"
	"time"
)

// no ambiguous letters
// i (1)
// o (0)
// s (5)
// z (2)
const ID_CHARACTER_SET = "1234567890abcdefghjklmnpqrtuvwxy"

var randomGenerator *rand.Rand

func init() {
	randomGenerator = rand.New(rand.NewSource(time.Now().UnixNano()))
}

func RandomId() string {
	randomId := ""
	for i := 1; i < 32; i++ {
		indexF := randomGenerator.Float64() * float64(len(ID_CHARACTER_SET))
		indexI := int(indexF)

		randomId = fmt.Sprintf("%s%s", randomId, string(ID_CHARACTER_SET[indexI]))
	}

	return randomId
}

package chain

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestParseNetwork(t *testing.T) {
	tests := []struct {
		input    string
		expected Network
	}{
		{"mainnet", Mainnet},
		{"testnet3", Testnet3},
		{"testnet4", Testnet4},
		{"signet", Signet},
		{"", Mainnet},
		{"unknown", Mainnet},
		{"TESTNET4", Mainnet},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			assert.Equal(t, tt.expected, ParseNetwork(tt.input))
		})
	}
}

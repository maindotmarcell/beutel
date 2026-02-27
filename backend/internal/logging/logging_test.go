package logging_test

import (
	"sync"
	"testing"

	"github.com/maindotmarcell/beutel-backend/internal/logging"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAdd_Get_RoundTrip(t *testing.T) {
	lc := logging.NewLogContext()
	lc.Add("k", "v")
	v, ok := lc.Get("k")
	require.True(t, ok)
	assert.Equal(t, "v", v)
}

func TestGet_MissingKey(t *testing.T) {
	lc := logging.NewLogContext()
	v, ok := lc.Get("missing")
	assert.False(t, ok)
	assert.Nil(t, v)
}

func TestAdd_Overwrites(t *testing.T) {
	lc := logging.NewLogContext()
	lc.Add("k", "first")
	lc.Add("k", "second")
	v, ok := lc.Get("k")
	require.True(t, ok)
	assert.Equal(t, "second", v)
}

func TestFields_ReturnsCopy(t *testing.T) {
	lc := logging.NewLogContext()
	lc.Add("k", "v")

	fields := lc.Fields()
	fields["k"] = "mutated"
	fields["new"] = "extra"

	// Internal state must be unchanged
	v, ok := lc.Get("k")
	require.True(t, ok)
	assert.Equal(t, "v", v)

	_, ok = lc.Get("new")
	assert.False(t, ok)
}

func TestNewLogContext_Empty(t *testing.T) {
	lc := logging.NewLogContext()
	assert.Empty(t, lc.Fields())
}

func TestConcurrentSafety(t *testing.T) {
	lc := logging.NewLogContext()
	var wg sync.WaitGroup
	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			lc.Add("key", i)
			lc.Get("key")
			lc.Fields()
		}(i)
	}
	wg.Wait()
}

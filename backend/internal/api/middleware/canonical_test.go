package middleware_test

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/maindotmarcell/beutel-backend/internal/api/middleware"
	"github.com/rs/zerolog"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func newMiddlewareApp(buf *bytes.Buffer) *fiber.App {
	app := fiber.New(fiber.Config{DisableStartupMessage: true})
	app.Use(middleware.CanonicalLog(zerolog.New(buf)))
	app.Get("/test", func(c *fiber.Ctx) error { return c.SendStatus(200) })
	app.Get("/warn", func(c *fiber.Ctx) error { return c.SendStatus(404) })
	app.Get("/error", func(c *fiber.Ctx) error { return c.SendStatus(500) })
	return app
}

func parseLog(t *testing.T, buf *bytes.Buffer) map[string]interface{} {
	t.Helper()
	var entry map[string]interface{}
	require.NoError(t, json.Unmarshal(buf.Bytes(), &entry))
	return entry
}

func TestSetsRequestIDHeader(t *testing.T) {
	var buf bytes.Buffer
	app := newMiddlewareApp(&buf)

	req := httptest.NewRequest("GET", "/test", nil)
	resp, err := app.Test(req, -1)
	require.NoError(t, err)
	assert.NotEmpty(t, resp.Header.Get("X-Request-ID"))
}

func TestLogsRequiredFields(t *testing.T) {
	var buf bytes.Buffer
	app := newMiddlewareApp(&buf)

	req := httptest.NewRequest("GET", "/test", nil)
	_, err := app.Test(req, -1)
	require.NoError(t, err)

	entry := parseLog(t, &buf)
	assert.Contains(t, entry, "request_id")
	assert.Contains(t, entry, "method")
	assert.Contains(t, entry, "path")
	assert.Contains(t, entry, "status")
	assert.Contains(t, entry, "duration_ms")
}

func TestLogLevel_2xx_Info(t *testing.T) {
	var buf bytes.Buffer
	app := newMiddlewareApp(&buf)

	req := httptest.NewRequest("GET", "/test", nil)
	_, err := app.Test(req, -1)
	require.NoError(t, err)

	entry := parseLog(t, &buf)
	assert.Equal(t, "info", entry["level"])
}

func TestLogLevel_4xx_Warn(t *testing.T) {
	var buf bytes.Buffer
	app := newMiddlewareApp(&buf)

	req := httptest.NewRequest("GET", "/warn", nil)
	_, err := app.Test(req, -1)
	require.NoError(t, err)

	entry := parseLog(t, &buf)
	assert.Equal(t, "warn", entry["level"])
}

func TestLogLevel_5xx_Error(t *testing.T) {
	var buf bytes.Buffer
	app := newMiddlewareApp(&buf)

	req := httptest.NewRequest("GET", "/error", nil)
	_, err := app.Test(req, -1)
	require.NoError(t, err)

	entry := parseLog(t, &buf)
	assert.Equal(t, "error", entry["level"])
}

func TestUniqueRequestIDs(t *testing.T) {
	var buf1, buf2 bytes.Buffer

	app1 := newMiddlewareApp(&buf1)
	req1 := httptest.NewRequest("GET", "/test", nil)
	resp1, err := app1.Test(req1, -1)
	require.NoError(t, err)

	app2 := newMiddlewareApp(&buf2)
	req2 := httptest.NewRequest("GET", "/test", nil)
	resp2, err := app2.Test(req2, -1)
	require.NoError(t, err)

	id1 := resp1.Header.Get("X-Request-ID")
	id2 := resp2.Header.Get("X-Request-ID")
	assert.NotEmpty(t, id1)
	assert.NotEmpty(t, id2)
	assert.NotEqual(t, id1, id2)
}

func TestGetLogContext_Fallback(t *testing.T) {
	// A handler with no middleware should still get a non-nil LogContext via fallback
	app := fiber.New(fiber.Config{DisableStartupMessage: true})
	var gotCtx interface{}
	app.Get("/fallback", func(c *fiber.Ctx) error {
		gotCtx = middleware.GetLogContext(c)
		return c.SendStatus(200)
	})

	req := httptest.NewRequest("GET", "/fallback", nil)
	_, err := app.Test(req, -1)
	require.NoError(t, err)
	assert.NotNil(t, gotCtx)
}

func TestLogOutputJSON_Structure(t *testing.T) {
	var buf bytes.Buffer
	app := newMiddlewareApp(&buf)

	req := httptest.NewRequest("GET", "/test", nil)
	_, err := app.Test(req, -1)
	require.NoError(t, err)

	entry := parseLog(t, &buf)
	assert.Equal(t, "GET", entry["method"])
	assert.Equal(t, "/test", entry["path"])
	assert.Equal(t, float64(200), entry["status"])
	assert.Equal(t, "request", entry["message"])
}

func TestLogOutput_ResponseBytes(t *testing.T) {
	var buf bytes.Buffer
	app := newMiddlewareApp(&buf)

	req := httptest.NewRequest("GET", "/test", nil)
	_, err := app.Test(req, -1)
	require.NoError(t, err)

	entry := parseLog(t, &buf)
	rb, ok := entry["response_bytes"]
	assert.True(t, ok, "response_bytes should be present in log")
	_, isNum := rb.(float64) // JSON numbers decode as float64
	assert.True(t, isNum, "response_bytes should be numeric")
}

func TestMiddleware_PassesThroughHandlerError(t *testing.T) {
	var buf bytes.Buffer
	app := fiber.New(fiber.Config{DisableStartupMessage: true})
	app.Use(middleware.CanonicalLog(zerolog.New(&buf)))
	app.Get("/fail", func(c *fiber.Ctx) error {
		return fiber.NewError(fiber.StatusInternalServerError, "boom")
	})

	req := httptest.NewRequest("GET", "/fail", nil)
	resp, err := app.Test(req, -1)
	require.NoError(t, err)
	assert.Equal(t, 500, resp.StatusCode)

	// Middleware should still have logged
	assert.True(t, buf.Len() > 0, "middleware should emit a log line even on error")
	entry := parseLog(t, &buf)
	assert.Contains(t, entry, "status")
}

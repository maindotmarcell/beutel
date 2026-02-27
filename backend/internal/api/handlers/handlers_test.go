package handlers_test

import (
	"encoding/json"
	"errors"
	"io"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/maindotmarcell/beutel-backend/pkg/types"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// ─── TestGetBalance ────────────────────────────────────────────────────────

func TestGetBalance(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		mock := &mockProvider{balance: &types.Balance{Confirmed: 1000, Unconfirmed: 200, Total: 1200}}
		app := newTestApp(mock)

		req := httptest.NewRequest("GET", "/v1/address/addr1/balance", nil)
		resp, err := app.Test(req, -1)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		var bal types.Balance
		require.NoError(t, json.NewDecoder(resp.Body).Decode(&bal))
		assert.Equal(t, int64(1000), bal.Confirmed)
		assert.Equal(t, int64(200), bal.Unconfirmed)
		assert.Equal(t, int64(1200), bal.Total)
	})

	t.Run("provider_error", func(t *testing.T) {
		mock := &mockProvider{balanceErr: errors.New("timeout")}
		app := newTestApp(mock)

		req := httptest.NewRequest("GET", "/v1/address/addr1/balance", nil)
		resp, err := app.Test(req, -1)
		require.NoError(t, err)
		assert.Equal(t, 502, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "timeout")
	})
}

// ─── TestGetUTXOs ─────────────────────────────────────────────────────────

func TestGetUTXOs(t *testing.T) {
	t.Run("success_two", func(t *testing.T) {
		mock := &mockProvider{utxos: []types.UTXO{
			{Txid: "tx1", Vout: 0, Value: 5000, Confirmed: true},
			{Txid: "tx2", Vout: 1, Value: 3000, Confirmed: false},
		}}
		app := newTestApp(mock)

		req := httptest.NewRequest("GET", "/v1/address/addr1/utxos", nil)
		resp, err := app.Test(req, -1)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		var utxos []types.UTXO
		require.NoError(t, json.NewDecoder(resp.Body).Decode(&utxos))
		assert.Len(t, utxos, 2)
	})

	t.Run("success_empty", func(t *testing.T) {
		mock := &mockProvider{utxos: []types.UTXO{}}
		app := newTestApp(mock)

		req := httptest.NewRequest("GET", "/v1/address/addr1/utxos", nil)
		resp, err := app.Test(req, -1)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Equal(t, "[]", strings.TrimSpace(string(body)))
	})

	t.Run("provider_error", func(t *testing.T) {
		mock := &mockProvider{utxosErr: errors.New("err")}
		app := newTestApp(mock)

		req := httptest.NewRequest("GET", "/v1/address/addr1/utxos", nil)
		resp, err := app.Test(req, -1)
		require.NoError(t, err)
		assert.Equal(t, 502, resp.StatusCode)
	})
}

// ─── TestGetTransactions ───────────────────────────────────────────────────

func TestGetTransactions(t *testing.T) {
	t.Run("success_two", func(t *testing.T) {
		mock := &mockProvider{transactions: []types.Transaction{
			{Txid: "tx1", Type: "receive", AmountSats: 1000},
			{Txid: "tx2", Type: "send", AmountSats: 500},
		}}
		app := newTestApp(mock)

		req := httptest.NewRequest("GET", "/v1/address/addr1/transactions", nil)
		resp, err := app.Test(req, -1)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		var txs []types.Transaction
		require.NoError(t, json.NewDecoder(resp.Body).Decode(&txs))
		assert.Len(t, txs, 2)
	})

	t.Run("success_empty", func(t *testing.T) {
		mock := &mockProvider{transactions: []types.Transaction{}}
		app := newTestApp(mock)

		req := httptest.NewRequest("GET", "/v1/address/addr1/transactions", nil)
		resp, err := app.Test(req, -1)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Equal(t, "[]", strings.TrimSpace(string(body)))
	})

	t.Run("provider_error", func(t *testing.T) {
		mock := &mockProvider{transErr: errors.New("err")}
		app := newTestApp(mock)

		req := httptest.NewRequest("GET", "/v1/address/addr1/transactions", nil)
		resp, err := app.Test(req, -1)
		require.NoError(t, err)
		assert.Equal(t, 502, resp.StatusCode)
	})
}

// ─── TestGetFees ───────────────────────────────────────────────────────────

func TestGetFees(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		mock := &mockProvider{feeRates: &types.FeeRates{
			FastestFee: 10, HalfHourFee: 5, HourFee: 3, EconomyFee: 2, MinimumFee: 1,
		}}
		app := newTestApp(mock)

		req := httptest.NewRequest("GET", "/v1/fees", nil)
		resp, err := app.Test(req, -1)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		var fees types.FeeRates
		require.NoError(t, json.NewDecoder(resp.Body).Decode(&fees))
		assert.Equal(t, 10, fees.FastestFee)
	})

	t.Run("provider_error", func(t *testing.T) {
		mock := &mockProvider{feesErr: errors.New("err")}
		app := newTestApp(mock)

		req := httptest.NewRequest("GET", "/v1/fees", nil)
		resp, err := app.Test(req, -1)
		require.NoError(t, err)
		assert.Equal(t, 502, resp.StatusCode)
	})
}

// ─── TestBroadcastTx ──────────────────────────────────────────────────────

func TestBroadcastTx(t *testing.T) {
	tests := []struct {
		name       string
		body       string
		mock       *mockProvider
		wantStatus int
		wantBody   string
	}{
		{
			name:       "success",
			body:       `{"txHex":"deadbeef"}`,
			mock:       &mockProvider{txid: "abc123"},
			wantStatus: 200,
			wantBody:   `"abc123"`,
		},
		{
			name:       "empty_txhex",
			body:       `{"txHex":""}`,
			mock:       &mockProvider{},
			wantStatus: 400,
			wantBody:   "txHex is required",
		},
		{
			name:       "missing_field",
			body:       `{}`,
			mock:       &mockProvider{},
			wantStatus: 400,
			wantBody:   "txHex is required",
		},
		{
			name:       "invalid_json",
			body:       `not-json`,
			mock:       &mockProvider{},
			wantStatus: 400,
			wantBody:   "invalid request body",
		},
		{
			name:       "provider_error",
			body:       `{"txHex":"deadbeef"}`,
			mock:       &mockProvider{broadcastErr: errors.New("rejected")},
			wantStatus: 502,
			wantBody:   "rejected",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			app := newTestApp(tt.mock)
			req := httptest.NewRequest("POST", "/v1/tx/broadcast", strings.NewReader(tt.body))
			req.Header.Set("Content-Type", "application/json")
			resp, err := app.Test(req, -1)
			require.NoError(t, err)
			assert.Equal(t, tt.wantStatus, resp.StatusCode)
			body, _ := io.ReadAll(resp.Body)
			assert.Contains(t, string(body), tt.wantBody)
		})
	}
}

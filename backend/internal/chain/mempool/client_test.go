package mempool

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/maindotmarcell/beutel-backend/internal/chain"
	"github.com/maindotmarcell/beutel-backend/internal/logging"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// newTestClient creates a Client backed by the given test server.
func newTestClient(t *testing.T, handler http.Handler) *Client {
	t.Helper()
	ts := httptest.NewServer(handler)
	t.Cleanup(ts.Close)
	return &Client{httpClient: ts.Client(), network: chain.Mainnet, baseURL: ts.URL}
}

// helpers for building mempoolTx fixtures
func inp(addr string, val int64) mempoolTxInput {
	return mempoolTxInput{Prevout: &struct {
		ScriptpubkeyAddress string `json:"scriptpubkey_address"`
		Value               int64  `json:"value"`
	}{ScriptpubkeyAddress: addr, Value: val}}
}

func out(addr string, val int64) mempoolTxOutput {
	return mempoolTxOutput{ScriptpubkeyAddress: addr, Value: val}
}

func nilInp() mempoolTxInput {
	return mempoolTxInput{Prevout: nil}
}

// ─── TestNewClient_BaseURLs ────────────────────────────────────────────────

func TestNewClient_BaseURLs(t *testing.T) {
	tests := []struct {
		network     chain.Network
		wantBaseURL string
	}{
		{chain.Mainnet, "https://mempool.space"},
		{chain.Testnet3, "https://mempool.space/testnet"},
		{chain.Testnet4, "https://mempool.space/testnet4"},
		{chain.Signet, "https://mempool.space/signet"},
	}
	for _, tt := range tests {
		t.Run(string(tt.network), func(t *testing.T) {
			c := NewClient(tt.network)
			assert.Equal(t, tt.wantBaseURL, c.baseURL)
		})
	}
}

// ─── TestGetBalance ────────────────────────────────────────────────────────

func TestGetBalance(t *testing.T) {
	tests := []struct {
		name        string
		handler     http.HandlerFunc
		wantConfirm int64
		wantUnconf  int64
		wantTotal   int64
		wantErr     bool
		wantErrStr  string
	}{
		{
			name: "success",
			handler: func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusOK)
				io.WriteString(w, `{"chain_stats":{"funded_txo_sum":1000,"spent_txo_sum":0},"mempool_stats":{"funded_txo_sum":200,"spent_txo_sum":0}}`)
			},
			wantConfirm: 1000,
			wantUnconf:  200,
			wantTotal:   1200,
		},
		{
			name: "zero_balance",
			handler: func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusOK)
				io.WriteString(w, `{"chain_stats":{"funded_txo_sum":0,"spent_txo_sum":0},"mempool_stats":{"funded_txo_sum":0,"spent_txo_sum":0}}`)
			},
			wantConfirm: 0,
			wantUnconf:  0,
			wantTotal:   0,
		},
		{
			name: "upstream_404",
			handler: func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusNotFound)
				io.WriteString(w, "not found")
			},
			wantErr:    true,
			wantErrStr: "status 404",
		},
		{
			name: "invalid_json",
			handler: func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusOK)
				io.WriteString(w, `"not-json"`)
			},
			wantErr:    true,
			wantErrStr: "decode",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := newTestClient(t, tt.handler)
			logCtx := logging.NewLogContext()
			bal, err := c.GetBalance(logCtx, "addr1")
			if tt.wantErr {
				require.Error(t, err)
				assert.Contains(t, err.Error(), tt.wantErrStr)
				assert.Nil(t, bal)
				return
			}
			require.NoError(t, err)
			assert.Equal(t, tt.wantConfirm, bal.Confirmed)
			assert.Equal(t, tt.wantUnconf, bal.Unconfirmed)
			assert.Equal(t, tt.wantTotal, bal.Total)

			// logCtx should record upstream fields on success
			_, ok := logCtx.Get("upstream_url")
			assert.True(t, ok, "upstream_url should be recorded")
			_, ok = logCtx.Get("upstream_status")
			assert.True(t, ok, "upstream_status should be recorded")
			_, ok = logCtx.Get("upstream_duration_ms")
			assert.True(t, ok, "upstream_duration_ms should be recorded")
		})
	}

	t.Run("network_error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
		c := &Client{httpClient: ts.Client(), network: chain.Mainnet, baseURL: ts.URL}
		ts.Close() // close before calling
		logCtx := logging.NewLogContext()
		bal, err := c.GetBalance(logCtx, "addr1")
		require.Error(t, err)
		assert.Nil(t, bal)
		_, ok := logCtx.Get("upstream_error")
		assert.True(t, ok, "upstream_error should be recorded on network failure")
	})
}

// ─── TestGetUTXOs ──────────────────────────────────────────────────────────

func TestGetUTXOs(t *testing.T) {
	successBody := `[
		{"txid":"tx1","vout":0,"value":5000,"status":{"confirmed":true,"block_height":800000}},
		{"txid":"tx2","vout":1,"value":3000,"status":{"confirmed":false,"block_height":0}}
	]`

	tests := []struct {
		name       string
		handler    http.HandlerFunc
		wantLen    int
		wantErr    bool
	}{
		{
			name: "success_two",
			handler: func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusOK)
				io.WriteString(w, successBody)
			},
			wantLen: 2,
		},
		{
			name: "success_empty",
			handler: func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusOK)
				io.WriteString(w, `[]`)
			},
			wantLen: 0,
		},
		{
			name: "upstream_503",
			handler: func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusServiceUnavailable)
			},
			wantErr: true,
		},
		{
			name: "invalid_json",
			handler: func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusOK)
				io.WriteString(w, `{}`)
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := newTestClient(t, tt.handler)
			logCtx := logging.NewLogContext()
			utxos, err := c.GetUTXOs(logCtx, "addr1")
			if tt.wantErr {
				require.Error(t, err)
				return
			}
			require.NoError(t, err)
			assert.Len(t, utxos, tt.wantLen)
		})
	}

	t.Run("success_field_mapping", func(t *testing.T) {
		handler := func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			io.WriteString(w, `[{"txid":"abcd","vout":2,"value":9000,"status":{"confirmed":true,"block_height":750000}}]`)
		}
		c := newTestClient(t, http.HandlerFunc(handler))
		utxos, err := c.GetUTXOs(logging.NewLogContext(), "addr1")
		require.NoError(t, err)
		require.Len(t, utxos, 1)
		u := utxos[0]
		assert.Equal(t, "abcd", u.Txid)
		assert.Equal(t, 2, u.Vout)
		assert.Equal(t, int64(9000), u.Value)
		assert.True(t, u.Confirmed)
		assert.Equal(t, int64(750000), u.BlockHeight)
	})
}

// ─── TestGetTransactions ───────────────────────────────────────────────────

func TestGetTransactions(t *testing.T) {
	twoTxBody := `[
		{"txid":"tx1","status":{"confirmed":true,"block_height":800000,"block_time":1700000000},"vin":[{"prevout":{"scriptpubkey_address":"OTHER","value":1000}}],"vout":[{"scriptpubkey_address":"SELF","value":900}],"fee":100},
		{"txid":"tx2","status":{"confirmed":false,"block_height":0,"block_time":0},"vin":[{"prevout":{"scriptpubkey_address":"SELF","value":900}}],"vout":[{"scriptpubkey_address":"OTHER2","value":800}],"fee":100}
	]`

	tests := []struct {
		name    string
		handler http.HandlerFunc
		wantLen int
		wantErr bool
	}{
		{
			name: "success_two",
			handler: func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusOK)
				io.WriteString(w, twoTxBody)
			},
			wantLen: 2,
		},
		{
			name: "success_empty",
			handler: func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusOK)
				io.WriteString(w, `[]`)
			},
			wantLen: 0,
		},
		{
			name: "upstream_500",
			handler: func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusInternalServerError)
			},
			wantErr: true,
		},
		{
			name: "invalid_json",
			handler: func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusOK)
				io.WriteString(w, `"bad"`)
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := newTestClient(t, tt.handler)
			txs, err := c.GetTransactions(logging.NewLogContext(), "SELF")
			if tt.wantErr {
				require.Error(t, err)
				return
			}
			require.NoError(t, err)
			assert.Len(t, txs, tt.wantLen)
		})
	}
}

// ─── TestGetFeeRates ───────────────────────────────────────────────────────

func TestGetFeeRates(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		handler := func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			io.WriteString(w, `{"fastestFee":5,"halfHourFee":3,"hourFee":2,"economyFee":1,"minimumFee":1}`)
		}
		c := newTestClient(t, http.HandlerFunc(handler))
		fees, err := c.GetFeeRates(logging.NewLogContext())
		require.NoError(t, err)
		require.NotNil(t, fees)
		assert.Equal(t, 5, fees.FastestFee)
		assert.Equal(t, 3, fees.HalfHourFee)
		assert.Equal(t, 2, fees.HourFee)
		assert.Equal(t, 1, fees.EconomyFee)
		assert.Equal(t, 1, fees.MinimumFee)
	})

	t.Run("upstream_404", func(t *testing.T) {
		handler := func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusNotFound)
		}
		c := newTestClient(t, http.HandlerFunc(handler))
		fees, err := c.GetFeeRates(logging.NewLogContext())
		require.Error(t, err)
		assert.Nil(t, fees)
	})
}

// ─── TestBroadcastTx ──────────────────────────────────────────────────────

func TestBroadcastTx(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		handler := func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			io.WriteString(w, "abc123\n")
		}
		c := newTestClient(t, http.HandlerFunc(handler))
		txid, err := c.BroadcastTx(logging.NewLogContext(), "deadbeef")
		require.NoError(t, err)
		assert.Equal(t, "abc123", txid)
	})

	t.Run("upstream_400", func(t *testing.T) {
		handler := func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusBadRequest)
			io.WriteString(w, "bad-tx")
		}
		c := newTestClient(t, http.HandlerFunc(handler))
		txid, err := c.BroadcastTx(logging.NewLogContext(), "deadbeef")
		require.Error(t, err)
		assert.Contains(t, err.Error(), "status 400")
		assert.Empty(t, txid)
	})

	t.Run("network_error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
		c := &Client{httpClient: ts.Client(), network: chain.Mainnet, baseURL: ts.URL}
		ts.Close()
		txid, err := c.BroadcastTx(logging.NewLogContext(), "deadbeef")
		require.Error(t, err)
		assert.Empty(t, txid)
	})

	t.Run("request_body_correct", func(t *testing.T) {
		const txHex = "cafebabe"
		var gotMethod, gotContentType, gotBody string
		handler := func(w http.ResponseWriter, r *http.Request) {
			gotMethod = r.Method
			gotContentType = r.Header.Get("Content-Type")
			b, _ := io.ReadAll(r.Body)
			gotBody = string(b)
			w.WriteHeader(http.StatusOK)
			io.WriteString(w, "txid1")
		}
		c := newTestClient(t, http.HandlerFunc(handler))
		_, err := c.BroadcastTx(logging.NewLogContext(), txHex)
		require.NoError(t, err)
		assert.Equal(t, http.MethodPost, gotMethod)
		assert.Contains(t, gotContentType, "text/plain")
		assert.Equal(t, txHex, strings.TrimSpace(gotBody))
	})
}

// ─── TestEnrichTransaction ────────────────────────────────────────────────

func TestEnrichTransaction(t *testing.T) {
	const SELF = "SELF"

	tests := []struct {
		name          string
		vin           []mempoolTxInput
		vout          []mempoolTxOutput
		wantType      string
		wantAmount    int64
		wantOtherAddr string
	}{
		{
			name:          "receive_basic",
			vin:           []mempoolTxInput{inp("OTHER", 100_000)},
			vout:          []mempoolTxOutput{out(SELF, 99_000)},
			wantType:      "receive",
			wantAmount:    99_000,
			wantOtherAddr: "OTHER",
		},
		{
			name:          "send_with_change",
			vin:           []mempoolTxInput{inp(SELF, 100_000)},
			vout:          []mempoolTxOutput{out("OTHER", 90_000), out(SELF, 9_000)},
			wantType:      "send",
			wantAmount:    90_000,
			wantOtherAddr: "OTHER",
		},
		{
			name:          "send_no_change",
			vin:           []mempoolTxInput{inp(SELF, 100_000)},
			vout:          []mempoolTxOutput{out("OTHER", 99_000)},
			wantType:      "send",
			wantAmount:    99_000,
			wantOtherAddr: "OTHER",
		},
		{
			name:          "receive_multi_outputs_to_self",
			vin:           []mempoolTxInput{inp("OTHER", 200_000)},
			vout:          []mempoolTxOutput{out(SELF, 100_000), out(SELF, 100_000)},
			wantType:      "receive",
			wantAmount:    200_000,
			wantOtherAddr: "OTHER",
		},
		{
			name:          "send_multi_recipients",
			vin:           []mempoolTxInput{inp(SELF, 100_000)},
			vout:          []mempoolTxOutput{out("A", 40_000), out("B", 50_000), out(SELF, 5_000)},
			wantType:      "send",
			wantAmount:    90_000,
			wantOtherAddr: "A",
		},
		{
			name:          "receive_coinbase_nil_prevout",
			vin:           []mempoolTxInput{nilInp()},
			vout:          []mempoolTxOutput{out(SELF, 625_000_000)},
			wantType:      "receive",
			wantAmount:    625_000_000,
			wantOtherAddr: "",
		},
		{
			name:          "send_self_transfer",
			vin:           []mempoolTxInput{inp(SELF, 100_000)},
			vout:          []mempoolTxOutput{out(SELF, 99_000)},
			wantType:      "send",
			wantAmount:    0,
			wantOtherAddr: SELF,
		},
		{
			name:          "receive_multi_senders",
			vin:           []mempoolTxInput{inp("A", 50_000), inp("B", 50_000)},
			vout:          []mempoolTxOutput{out(SELF, 99_000)},
			wantType:      "receive",
			wantAmount:    99_000,
			wantOtherAddr: "A",
		},
		{
			name:          "receive_empty_vin",
			vin:           []mempoolTxInput{},
			vout:          []mempoolTxOutput{out(SELF, 1_000)},
			wantType:      "receive",
			wantAmount:    1_000,
			wantOtherAddr: "",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			tx := mempoolTx{Vin: tt.vin, Vout: tt.vout}
			result := enrichTransaction(tx, SELF)
			assert.Equal(t, tt.wantType, result.Type)
			assert.Equal(t, tt.wantAmount, result.AmountSats)
			assert.Equal(t, tt.wantOtherAddr, result.OtherAddr)
		})
	}

	t.Run("metadata_passthrough", func(t *testing.T) {
		t.Parallel()
		tx := mempoolTx{
			Txid: "deadbeef",
			Status: struct {
				Confirmed   bool  `json:"confirmed"`
				BlockHeight int64 `json:"block_height"`
				BlockTime   int64 `json:"block_time"`
			}{
				Confirmed:   true,
				BlockHeight: 800_001,
				BlockTime:   1_700_000_000,
			},
			Vin:  []mempoolTxInput{inp("OTHER", 1_000)},
			Vout: []mempoolTxOutput{out(SELF, 900)},
			Fee:  100,
		}
		result := enrichTransaction(tx, SELF)
		assert.Equal(t, "deadbeef", result.Txid)
		assert.Equal(t, "receive", result.Type)
		assert.Equal(t, int64(900), result.AmountSats)
		assert.Equal(t, "OTHER", result.OtherAddr)
		assert.True(t, result.Confirmed)
		assert.Equal(t, int64(800_001), result.BlockHeight)
		assert.Equal(t, int64(1_700_000_000), result.BlockTime)
		assert.Equal(t, int64(100), result.FeeSats)
	})
}

package handlers_test

import (
	"github.com/gofiber/fiber/v2"
	"github.com/maindotmarcell/beutel-backend/internal/api/handlers"
	"github.com/maindotmarcell/beutel-backend/internal/chain"
	"github.com/maindotmarcell/beutel-backend/internal/logging"
	"github.com/maindotmarcell/beutel-backend/pkg/types"
)

type mockProvider struct {
	balance      *types.Balance
	balanceErr   error
	utxos        []types.UTXO
	utxosErr     error
	transactions []types.Transaction
	transErr     error
	feeRates     *types.FeeRates
	feesErr      error
	txid         string
	broadcastErr error
	network      chain.Network
}

func (m *mockProvider) GetBalance(_ *logging.LogContext, _ string) (*types.Balance, error) {
	return m.balance, m.balanceErr
}

func (m *mockProvider) GetUTXOs(_ *logging.LogContext, _ string) ([]types.UTXO, error) {
	return m.utxos, m.utxosErr
}

func (m *mockProvider) GetTransactions(_ *logging.LogContext, _ string, _ []string) ([]types.Transaction, error) {
	return m.transactions, m.transErr
}

func (m *mockProvider) GetFeeRates(_ *logging.LogContext) (*types.FeeRates, error) {
	return m.feeRates, m.feesErr
}

func (m *mockProvider) BroadcastTx(_ *logging.LogContext, _ string) (string, error) {
	return m.txid, m.broadcastErr
}

func (m *mockProvider) Network() chain.Network {
	return m.network
}

func newTestApp(provider chain.Provider) *fiber.App {
	app := fiber.New(fiber.Config{DisableStartupMessage: true})
	h := handlers.NewHandler(provider)
	app.Get("/v1/address/:address/balance", h.GetBalance)
	app.Get("/v1/address/:address/utxos", h.GetUTXOs)
	app.Get("/v1/address/:address/transactions", h.GetTransactions)
	app.Get("/v1/fees", h.GetFees)
	app.Post("/v1/tx/broadcast", h.BroadcastTx)
	return app
}

package handlers

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/maindotmarcell/beutel-backend/internal/api/middleware"
)

// GetTransactions returns transaction history for an address
func (h *Handler) GetTransactions(c *fiber.Ctx) error {
	logCtx := middleware.GetLogContext(c)
	address := c.Params("address")

	// Add request-specific fields to canonical log
	logCtx.Add("address", address)

	// Parse optional owned addresses for multi-address enrichment
	var ownedAddresses []string
	if owned := c.Query("owned"); owned != "" {
		ownedAddresses = strings.Split(owned, ",")
	}

	txs, err := h.provider.GetTransactions(logCtx, address, ownedAddresses)
	if err != nil {
		logCtx.Add("error", err.Error())
		logCtx.Add("error_type", "upstream_error")
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(txs)
}

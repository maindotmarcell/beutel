import { UTXO, FeeRates } from "@/types/wallet";
import { BalanceResponse, TransactionResponse, UTXOResponse } from "@/types/api";

// Backend API configuration
// TODO: Make this configurable per environment (dev vs prod)
const BACKEND_URL = "http://localhost:3000";

// Re-export types for convenience
export type { BalanceResponse, TransactionResponse, UTXOResponse };

/**
 * Fetch the balance for a Bitcoin address
 */
export async function getAddressBalance(address: string): Promise<BalanceResponse> {
  const url = `${BACKEND_URL}/v1/address/${address}/balance`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(`Failed to fetch balance: ${error.error || response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch UTXOs (unspent transaction outputs) for an address
 */
export async function getAddressUtxos(address: string): Promise<UTXO[]> {
  const url = `${BACKEND_URL}/v1/address/${address}/utxos`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(`Failed to fetch UTXOs: ${error.error || response.statusText}`);
  }

  // Transform backend response to match UTXO type expected by mobile
  const utxos: UTXOResponse[] = await response.json();
  return utxos.map((u) => ({
    txid: u.txid,
    vout: u.vout,
    value: u.value,
    status: {
      confirmed: u.confirmed,
      block_height: u.blockHeight,
    },
  }));
}

/**
 * Fetch transaction history for an address
 * Backend returns enriched transactions with send/receive already calculated
 */
export async function getAddressTransactions(address: string): Promise<TransactionResponse[]> {
  const url = `${BACKEND_URL}/v1/address/${address}/transactions`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(`Failed to fetch transactions: ${error.error || response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch recommended fee rates
 * Returns fee rates in sat/vB for different confirmation targets
 */
export async function getRecommendedFees(): Promise<FeeRates> {
  const url = `${BACKEND_URL}/v1/fees`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(`Failed to fetch fee rates: ${error.error || response.statusText}`);
  }

  return response.json();
}

/**
 * Broadcast a signed transaction to the network
 * @param txHex - The signed transaction in hex format
 * @returns The transaction ID (txid) if successful
 */
export async function broadcastTransaction(txHex: string): Promise<string> {
  const url = `${BACKEND_URL}/v1/tx/broadcast`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ txHex }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(`Failed to broadcast transaction: ${error.error || response.statusText}`);
  }

  const data = await response.json();
  return data.txid;
}

import { NetworkType, UTXO, FeeRates, Transaction } from "@/types/wallet";
import * as mempoolApi from "@/api/mempoolApi";
import { satsToBtc } from "@/utils/bitcoinUtils";

export interface BalanceResult {
  confirmed: number; // in satoshis
  unconfirmed: number; // in satoshis
  total: number; // in satoshis
}

/**
 * Fetch the balance for a Bitcoin address
 */
export async function getAddressBalance(
  address: string,
  network: NetworkType
): Promise<BalanceResult> {
  // Network is now configured on the backend, not passed per-request
  return mempoolApi.getAddressBalance(address);
}

/**
 * Fetch UTXOs (unspent transaction outputs) for an address
 */
export async function getAddressUtxos(address: string, network: NetworkType): Promise<UTXO[]> {
  return mempoolApi.getAddressUtxos(address);
}

/**
 * Fetch recommended fee rates
 * Returns fee rates in sat/vB for different confirmation targets
 */
export async function getRecommendedFees(network: NetworkType): Promise<FeeRates> {
  return mempoolApi.getRecommendedFees();
}

/**
 * Broadcast a signed transaction to the network
 * @param txHex - The signed transaction in hex format
 * @returns The transaction ID (txid) if successful
 */
export async function broadcastTransaction(txHex: string, network: NetworkType): Promise<string> {
  return mempoolApi.broadcastTransaction(txHex);
}

/**
 * Fetch transaction history for a Bitcoin address
 * Backend returns enriched transactions with send/receive already calculated
 */
export async function getAddressTransactions(
  address: string,
  network: NetworkType
): Promise<Transaction[]> {
  const data = await mempoolApi.getAddressTransactions(address);

  // Transform backend response to our Transaction type
  const transactions: Transaction[] = data.map((tx) => {
    // Convert timestamp from unix seconds to Date
    const timestamp = tx.blockTime ? new Date(tx.blockTime * 1000) : new Date();

    // Convert amounts from satoshis to BTC
    const amountBtc = satsToBtc(tx.amountSats);
    const feeBtc = satsToBtc(tx.feeSats);

    // Map status
    const status: "pending" | "confirmed" | "failed" = tx.confirmed ? "confirmed" : "pending";

    return {
      id: tx.txid,
      type: tx.type,
      amount: amountBtc,
      address: tx.otherAddr || address, // Fallback to our address if no other found
      status,
      timestamp,
      fee: feeBtc,
      transactionType: "on-chain", // All transactions are on-chain
    };
  });

  // Sort by timestamp (newest first)
  transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return transactions;
}

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
  const data = await mempoolApi.getAddressData(address, network);

  // Calculate confirmed balance from chain stats
  const confirmed =
    data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;

  // Calculate unconfirmed balance from mempool stats
  const unconfirmed =
    data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum;

  return {
    confirmed,
    unconfirmed,
    total: confirmed + unconfirmed,
  };
}

/**
 * Fetch UTXOs (unspent transaction outputs) for an address
 */
export async function getAddressUtxos(
  address: string,
  network: NetworkType
): Promise<UTXO[]> {
  return mempoolApi.getAddressUtxos(address, network);
}

/**
 * Fetch recommended fee rates
 * Returns fee rates in sat/vB for different confirmation targets
 */
export async function getRecommendedFees(
  network: NetworkType
): Promise<FeeRates> {
  return mempoolApi.getRecommendedFees(network);
}

/**
 * Broadcast a signed transaction to the network
 * @param txHex - The signed transaction in hex format
 * @returns The transaction ID (txid) if successful
 */
export async function broadcastTransaction(
  txHex: string,
  network: NetworkType
): Promise<string> {
  return mempoolApi.broadcastTransaction(txHex, network);
}

/**
 * Fetch transaction history for a Bitcoin address
 * @param address - The Bitcoin address to fetch transactions for
 * @param network - The network to query (mainnet, testnet3, etc.)
 * @returns Array of transactions transformed to our Transaction type
 */
export async function getAddressTransactions(
  address: string,
  network: NetworkType
): Promise<Transaction[]> {
  const data = await mempoolApi.getAddressTransactions(address, network);

  // Transform API response to our Transaction type
  const transactions: Transaction[] = data.map((tx) => {
    // Check if address appears in inputs (send) or outputs (receive)
    const isInInputs = tx.vin.some(
      (input) => input.prevout?.scriptpubkey_address === address
    );
    const isInOutputs = tx.vout.some(
      (output) => output.scriptpubkey_address === address
    );

    // Determine transaction type
    // If address is in both inputs and outputs, it's a send (self-send)
    // If only in outputs, it's a receive
    // If only in inputs, it's a send
    const type: "send" | "receive" = isInInputs ? "send" : "receive";

    // Calculate net amount for this address
    // For sends: negative amount (what we sent out)
    // For receives: positive amount (what we received)
    let amountSats = 0;

    if (type === "send") {
      // For sends, sum all outputs to other addresses (excluding change back to us)
      amountSats = tx.vout
        .filter((output) => output.scriptpubkey_address !== address)
        .reduce((sum, output) => sum + (output.value || 0), 0);
    } else {
      // For receives, sum all outputs to our address
      amountSats = tx.vout
        .filter((output) => output.scriptpubkey_address === address)
        .reduce((sum, output) => sum + (output.value || 0), 0);
    }

    // Get the other party's address (for display)
    // For sends: get the recipient address (first output that's not us)
    // For receives: get the sender address (first input that's not us)
    let otherAddress = "";
    if (type === "send") {
      const recipientOutput = tx.vout.find(
        (output) => output.scriptpubkey_address !== address
      );
      otherAddress = recipientOutput?.scriptpubkey_address || "";
    } else {
      const senderInput = tx.vin.find(
        (input) => input.prevout?.scriptpubkey_address !== address
      );
      otherAddress = senderInput?.prevout?.scriptpubkey_address || "";
    }

    // If we couldn't find the other address, use the first output/input address
    if (!otherAddress) {
      if (type === "send" && tx.vout.length > 0) {
        otherAddress = tx.vout[0]?.scriptpubkey_address || "";
      } else if (type === "receive" && tx.vin.length > 0) {
        otherAddress = tx.vin[0]?.prevout?.scriptpubkey_address || "";
      }
    }

    // Map status
    const status: "pending" | "confirmed" | "failed" = tx.status.confirmed
      ? "confirmed"
      : "pending";

    // Convert timestamp
    const timestamp = tx.status.block_time
      ? new Date(tx.status.block_time * 1000)
      : new Date();

    // Convert amounts from satoshis to BTC
    const amountBtc = satsToBtc(amountSats);
    const feeBtc = satsToBtc(tx.fee || 0);

    return {
      id: tx.txid,
      type,
      amount: amountBtc,
      address: otherAddress || address, // Fallback to our address if no other found
      status,
      timestamp,
      fee: feeBtc,
      transactionType: "on-chain", // All mempool transactions are on-chain
    };
  });

  // Sort by timestamp (newest first)
  transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return transactions;
}


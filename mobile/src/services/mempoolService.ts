import { NetworkType, UTXO, FeeRates, Transaction } from "@/types/wallet";

// Mempool.space API base URLs
const API_BASE_URLS: Record<NetworkType, string> = {
  mainnet: "https://mempool.space/api",
  testnet3: "https://mempool.space/testnet/api",
  testnet4: "https://mempool.space/testnet4/api",
  signet: "https://mempool.space/signet/api",
};

// API response types
interface AddressStats {
  funded_txo_count: number;
  funded_txo_sum: number;
  spent_txo_count: number;
  spent_txo_sum: number;
}

interface AddressResponse {
  address: string;
  chain_stats: AddressStats;
  mempool_stats: AddressStats;
}

export interface BalanceResult {
  confirmed: number; // in satoshis
  unconfirmed: number; // in satoshis
  total: number; // in satoshis
}

/**
 * Fetch the balance for a Bitcoin address from Mempool.space API
 */
export async function getAddressBalance(
  address: string,
  network: NetworkType
): Promise<BalanceResult> {
  const baseUrl = API_BASE_URLS[network];
  const url = `${baseUrl}/address/${address}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch balance: ${response.status} ${response.statusText}`
    );
  }

  const data: AddressResponse = await response.json();

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
 * Convert satoshis to BTC
 */
export function satsToBtc(sats: number): number {
  return sats / 100_000_000;
}

/**
 * Convert BTC to satoshis
 */
export function btcToSats(btc: number): number {
  return Math.round(btc * 100_000_000);
}

/**
 * Fetch UTXOs (unspent transaction outputs) for an address
 */
export async function getAddressUtxos(
  address: string,
  network: NetworkType
): Promise<UTXO[]> {
  const baseUrl = API_BASE_URLS[network];
  const url = `${baseUrl}/address/${address}/utxo`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch UTXOs: ${response.status} ${response.statusText}`
    );
  }

  const utxos: UTXO[] = await response.json();
  return utxos;
}

/**
 * Fetch recommended fee rates from mempool.space
 * Returns fee rates in sat/vB for different confirmation targets
 */
export async function getRecommendedFees(
  network: NetworkType
): Promise<FeeRates> {
  const baseUrl = API_BASE_URLS[network];
  const url = `${baseUrl}/v1/fees/recommended`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch fee rates: ${response.status} ${response.statusText}`
    );
  }

  const feeRates: FeeRates = await response.json();
  return feeRates;
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
  const baseUrl = API_BASE_URLS[network];
  const url = `${baseUrl}/tx`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: txHex,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to broadcast transaction: ${errorText}`);
  }

  // The response is the txid as plain text
  const txid = await response.text();
  return txid;
}

// API response types for transactions
interface TransactionInput {
  prevout?: {
    scriptpubkey_address?: string;
    value?: number;
  };
}

interface TransactionOutput {
  scriptpubkey_address?: string;
  value: number; // in satoshis
}

interface TransactionResponse {
  txid: string;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
  vin: TransactionInput[];
  vout: TransactionOutput[];
  fee: number; // in satoshis
}

/**
 * Fetch transaction history for a Bitcoin address from Mempool.space API
 * @param address - The Bitcoin address to fetch transactions for
 * @param network - The network to query (mainnet, testnet3, etc.)
 * @returns Array of transactions transformed to our Transaction type
 */
export async function getAddressTransactions(
  address: string,
  network: NetworkType
): Promise<Transaction[]> {
  const baseUrl = API_BASE_URLS[network];
  const url = `${baseUrl}/address/${address}/txs`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch transactions: ${response.status} ${response.statusText}`
    );
  }

  const data: TransactionResponse[] = await response.json();

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

import { NetworkType, UTXO, FeeRates } from "@/types/wallet";

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

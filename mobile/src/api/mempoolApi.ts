import { NetworkType, UTXO, FeeRates } from "@/types/wallet";

// Mempool.space API base URLs
const API_BASE_URLS: Record<NetworkType, string> = {
  mainnet: "https://mempool.space/api",
  testnet3: "https://mempool.space/testnet/api",
  testnet4: "https://mempool.space/testnet4/api",
  signet: "https://mempool.space/signet/api",
};

// Raw API response types
export interface AddressStats {
  funded_txo_count: number;
  funded_txo_sum: number;
  spent_txo_count: number;
  spent_txo_sum: number;
}

export interface AddressResponse {
  address: string;
  chain_stats: AddressStats;
  mempool_stats: AddressStats;
}

export interface TransactionInput {
  prevout?: {
    scriptpubkey_address?: string;
    value?: number;
  };
}

export interface TransactionOutput {
  scriptpubkey_address?: string;
  value: number; // in satoshis
}

export interface TransactionResponse {
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
 * Fetch raw address data from Mempool.space API
 */
export async function getAddressData(
  address: string,
  network: NetworkType
): Promise<AddressResponse> {
  const baseUrl = API_BASE_URLS[network];
  const url = `${baseUrl}/address/${address}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch address data: ${response.status} ${response.statusText}`);
  }

  const data: AddressResponse = await response.json();
  return data;
}

/**
 * Fetch UTXOs (unspent transaction outputs) for an address
 */
export async function getAddressUtxos(address: string, network: NetworkType): Promise<UTXO[]> {
  const baseUrl = API_BASE_URLS[network];
  const url = `${baseUrl}/address/${address}/utxo`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch UTXOs: ${response.status} ${response.statusText}`);
  }

  const utxos: UTXO[] = await response.json();
  return utxos;
}

/**
 * Fetch recommended fee rates from mempool.space
 * Returns fee rates in sat/vB for different confirmation targets
 */
export async function getRecommendedFees(network: NetworkType): Promise<FeeRates> {
  const baseUrl = API_BASE_URLS[network];
  const url = `${baseUrl}/v1/fees/recommended`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch fee rates: ${response.status} ${response.statusText}`);
  }

  const feeRates: FeeRates = await response.json();
  return feeRates;
}

/**
 * Broadcast a signed transaction to the network
 * @param txHex - The signed transaction in hex format
 * @returns The transaction ID (txid) if successful
 */
export async function broadcastTransaction(txHex: string, network: NetworkType): Promise<string> {
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

/**
 * Fetch raw transaction history for a Bitcoin address from Mempool.space API
 * @param address - The Bitcoin address to fetch transactions for
 * @param network - The network to query (mainnet, testnet3, etc.)
 * @returns Array of raw transaction responses
 */
export async function getAddressTransactions(
  address: string,
  network: NetworkType
): Promise<TransactionResponse[]> {
  const baseUrl = API_BASE_URLS[network];
  const url = `${baseUrl}/address/${address}/txs`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
  }

  const data: TransactionResponse[] = await response.json();
  return data;
}

export type NetworkType = "mainnet" | "testnet3" | "testnet4" | "signet";

/** BIP44 chain index: 0 = external (receive), 1 = internal (change) */
export type AddressChain = 0 | 1;

export type TransactionType = "send" | "receive";

export type TransactionStatus = "pending" | "confirmed" | "failed";

export type TransactionNetworkType = "on-chain" | "lightning";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // in BTC
  address: string;
  status: TransactionStatus;
  timestamp: Date;
  fee: number; // in BTC
  transactionType: TransactionNetworkType; // on-chain or lightning
}

export interface WalletData {
  balance: number; // in BTC
  transactions: Transaction[];
}

/**
 * UTXO (Unspent Transaction Output) from mempool.space API
 */
export interface UTXO {
  txid: string;
  vout: number;
  value: number; // in satoshis
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
}

/**
 * UTXO tagged with its owning address and derivation info,
 * so the signing logic knows which key to use per input.
 */
export interface OwnedUTXO extends UTXO {
  ownerAddress: string;
  chain: AddressChain;
  addressIndex: number;
}

/**
 * Fee rates returned from mempool.space API (sat/vB)
 */
export interface FeeRates {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

/**
 * Transaction preview shown to user before confirming
 */
export interface TransactionPreview {
  recipientAddress: string;
  amountSats: number; // amount to send in satoshis
  feeSats: number; // estimated fee in satoshis
  totalSats: number; // amount + fee
  feeRate: number; // sat/vB used
  inputCount: number;
  changeAmount: number; // change back to sender in satoshis
  changeAddress?: string; // the change address for this transaction
}

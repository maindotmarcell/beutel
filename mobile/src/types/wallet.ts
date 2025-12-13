export type NetworkType = 'mainnet' | 'testnet4' | 'signet';

export type TransactionType = 'send' | 'receive';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export type TransactionNetworkType = 'on-chain' | 'lightning';

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


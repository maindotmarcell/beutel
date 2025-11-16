export type TransactionType = 'send' | 'receive';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // in BTC
  address: string;
  status: TransactionStatus;
  timestamp: Date;
}

export interface WalletData {
  balance: number; // in BTC
  transactions: Transaction[];
}


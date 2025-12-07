import { Transaction } from '@/types/wallet';
import { mockWalletData } from '@/data/mockWalletData';

export function getWalletBalance(): number {
  return mockWalletData.balance;
}

export function getTransactions(): Transaction[] {
  return mockWalletData.transactions;
}

export function getTransactionById(id: string): Transaction | undefined {
  return mockWalletData.transactions.find((tx) => tx.id === id);
}


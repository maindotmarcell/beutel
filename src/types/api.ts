/**
 * API Response Types
 * Types for responses from the beutel-backend
 */

export interface BalanceResponse {
  confirmed: number; // in satoshis
  unconfirmed: number; // in satoshis
  total: number; // in satoshis
}

export interface TransactionResponse {
  txid: string;
  type: "send" | "receive";
  amountSats: number;
  otherAddr: string;
  confirmed: boolean;
  blockHeight?: number;
  blockTime?: number;
  feeSats: number;
}

export interface UTXOResponse {
  txid: string;
  vout: number;
  value: number;
  confirmed: boolean;
  blockHeight?: number;
}

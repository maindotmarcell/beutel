import { create } from "zustand";
import {
  NetworkType,
  TransactionPreview,
  UTXO,
  Transaction,
} from "@/types/wallet";
import * as keyService from "@/services/keyService";
import * as bitcoinService from "@/services/bitcoinService";
import * as chainService from "@/services/chainService";

interface WalletState {
  // Wallet state
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Network
  network: NetworkType;

  // Current address info
  address: string | null;
  publicKey: string | null;

  // Balance (in satoshis)
  balance: number;
  unconfirmedBalance: number;
  isBalanceLoading: boolean;

  // Transactions
  transactions: Transaction[];
  isTransactionsLoading: boolean;
  transactionsError: string | null;

  // Send transaction state
  isSending: boolean;
  sendError: string | null;
  lastTxId: string | null;
  transactionPreview: TransactionPreview | null;
  utxos: UTXO[];

  // Actions
  setNetwork: (network: NetworkType) => void;
  initializeWallet: () => Promise<void>;
  createWallet: () => Promise<string>; // Returns mnemonic for backup
  importWallet: (mnemonic: string) => Promise<void>;
  deleteWallet: () => Promise<void>;
  refreshAddress: () => Promise<void>;
  fetchBalance: () => Promise<void>;
  fetchTransactions: () => Promise<void>;

  // Send transaction actions
  prepareSendTransaction: (
    recipientAddress: string,
    amountSats: number
  ) => Promise<TransactionPreview>;
  confirmSendTransaction: () => Promise<string>; // Returns txid
  clearSendState: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  // Initial state
  isInitialized: false,
  isLoading: false,
  error: null,
  network: "testnet3", // Default to testnet3 for safety
  address: null,
  publicKey: null,
  balance: 0,
  unconfirmedBalance: 0,
  isBalanceLoading: false,

  // Transactions
  transactions: [],
  isTransactionsLoading: false,
  transactionsError: null,

  // Send transaction state
  isSending: false,
  sendError: null,
  lastTxId: null,
  transactionPreview: null,
  utxos: [],

  setNetwork: (network: NetworkType) => {
    set({ network, balance: 0, unconfirmedBalance: 0, transactions: [] });
    // Refresh address and balance for new network
    get().refreshAddress();
    get().fetchBalance();
    get().fetchTransactions();
  },

  initializeWallet: async () => {
    set({ isLoading: true, error: null });

    try {
      const hasWallet = await keyService.hasMnemonic();

      if (hasWallet) {
        const mnemonic = await keyService.getMnemonic();
        if (mnemonic) {
          const { network } = get();
          const info = bitcoinService.getWalletInfo(mnemonic, network);
          set({
            isInitialized: true,
            address: info.address,
            publicKey: info.publicKey,
          });
          // Fetch balance and transactions after initialization
          get().fetchBalance();
          get().fetchTransactions();
        }
      }

      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize wallet",
      });
    }
  },

  createWallet: async () => {
    set({ isLoading: true, error: null });

    try {
      // Generate new mnemonic
      const mnemonic = keyService.generateMnemonic();

      // Store securely
      await keyService.storeMnemonic(mnemonic);

      // Get address for current network
      const { network } = get();
      const info = bitcoinService.getWalletInfo(mnemonic, network);

      set({
        isInitialized: true,
        isLoading: false,
        address: info.address,
        publicKey: info.publicKey,
      });

      // Fetch balance and transactions (will be 0/empty for new wallet but good to initialize)
      get().fetchBalance();
      get().fetchTransactions();

      // Return mnemonic so user can back it up
      return mnemonic;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to create wallet",
      });
      throw error;
    }
  },

  importWallet: async (mnemonic: string) => {
    set({ isLoading: true, error: null });

    try {
      // Validate mnemonic
      if (!keyService.validateMnemonic(mnemonic)) {
        throw new Error("Invalid seed phrase");
      }

      // Store securely
      await keyService.storeMnemonic(mnemonic);

      // Get address for current network
      const { network } = get();
      const info = bitcoinService.getWalletInfo(mnemonic, network);

      set({
        isInitialized: true,
        isLoading: false,
        address: info.address,
        publicKey: info.publicKey,
      });

      // Fetch balance and transactions for imported wallet
      get().fetchBalance();
      get().fetchTransactions();
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to import wallet",
      });
      throw error;
    }
  },

  deleteWallet: async () => {
    set({ isLoading: true, error: null });

    try {
      await keyService.deleteMnemonic();

      set({
        isInitialized: false,
        isLoading: false,
        address: null,
        publicKey: null,
        balance: 0,
        unconfirmedBalance: 0,
        transactions: [],
        transactionsError: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to delete wallet",
      });
      throw error;
    }
  },

  refreshAddress: async () => {
    try {
      const mnemonic = await keyService.getMnemonic();
      if (mnemonic) {
        const { network } = get();
        const info = bitcoinService.getWalletInfo(mnemonic, network);
        set({
          address: info.address,
          publicKey: info.publicKey,
        });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to refresh address",
      });
    }
  },

  fetchBalance: async () => {
    const { address, network } = get();

    if (!address) {
      return;
    }

    set({ isBalanceLoading: true });

    try {
      const result = await chainService.getAddressBalance(address, network);
      set({
        balance: result.confirmed,
        unconfirmedBalance: result.unconfirmed,
        isBalanceLoading: false,
      });
    } catch (error) {
      set({
        isBalanceLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch balance",
      });
    }
  },

  fetchTransactions: async () => {
    const { address, network } = get();

    if (!address) {
      return;
    }

    set({ isTransactionsLoading: true, transactionsError: null });

    try {
      const transactions = await chainService.getAddressTransactions(
        address,
        network
      );
      set({
        transactions,
        isTransactionsLoading: false,
        transactionsError: null,
      });
    } catch (error) {
      set({
        isTransactionsLoading: false,
        transactionsError:
          error instanceof Error
            ? error.message
            : "Failed to fetch transactions",
      });
    }
  },

  prepareSendTransaction: async (
    recipientAddress: string,
    amountSats: number
  ) => {
    const { address, network, balance } = get();

    set({ isSending: true, sendError: null, transactionPreview: null });

    try {
      // Validate recipient address
      if (!bitcoinService.isValidAddress(recipientAddress, network)) {
        throw new Error("Invalid recipient address");
      }

      // Validate amount
      if (amountSats <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      if (!address) {
        throw new Error("Wallet not initialized");
      }

      // Fetch UTXOs
      const utxos = await chainService.getAddressUtxos(address, network);

      if (utxos.length === 0) {
        throw new Error("No UTXOs available");
      }

      // Get recommended fees (use fastestFee)
      const feeRates = await chainService.getRecommendedFees(network);
      const feeRate = feeRates.fastestFee;

      // Prepare transaction preview
      const preview = bitcoinService.prepareTransactionPreview(
        utxos,
        recipientAddress,
        amountSats,
        feeRate
      );

      // Check if we have enough funds
      if (preview.totalSats > balance) {
        throw new Error(
          `Insufficient funds. Need ${preview.totalSats} sats, have ${balance} sats`
        );
      }

      set({
        isSending: false,
        transactionPreview: preview,
        utxos,
      });

      return preview;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to prepare transaction";
      set({
        isSending: false,
        sendError: errorMessage,
      });
      throw error;
    }
  },

  confirmSendTransaction: async () => {
    const { address, network, transactionPreview, utxos } = get();

    if (!transactionPreview) {
      throw new Error("No transaction prepared");
    }

    if (!address) {
      throw new Error("Wallet not initialized");
    }

    set({ isSending: true, sendError: null });

    try {
      // Get mnemonic for signing
      const mnemonic = await keyService.getMnemonic();
      if (!mnemonic) {
        throw new Error("Wallet not found");
      }

      // Build and sign the transaction
      const txHex = bitcoinService.buildAndSignTransaction(
        mnemonic,
        network,
        utxos,
        transactionPreview.recipientAddress,
        transactionPreview.amountSats,
        transactionPreview.feeRate,
        address
      );

      // Broadcast the transaction
      const txid = await chainService.broadcastTransaction(txHex, network);

      set({
        isSending: false,
        lastTxId: txid,
        transactionPreview: null,
        utxos: [],
      });

      // Refresh balance and transactions after sending
      get().fetchBalance();
      get().fetchTransactions();

      return txid;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send transaction";
      set({
        isSending: false,
        sendError: errorMessage,
      });
      throw error;
    }
  },

  clearSendState: () => {
    set({
      isSending: false,
      sendError: null,
      lastTxId: null,
      transactionPreview: null,
      utxos: [],
    });
  },
}));

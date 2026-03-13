import { create } from "zustand";
import { NetworkType, TransactionPreview, OwnedUTXO, Transaction } from "@/types/wallet";
import * as keyService from "@/services/keyService";
import * as bitcoinService from "@/services/bitcoinService";
import * as chainService from "@/services/chainService";
import { AddressDerivationInfo } from "@/services/chainService";

interface WalletState {
  // Wallet state
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Network
  network: NetworkType;

  // Current receive address (external chain, index 0)
  address: string | null;
  publicKey: string | null;

  // Change address tracking
  nextChangeIndex: number;
  changeAddresses: string[];

  // Balance (in satoshis) — aggregated across all owned addresses
  balance: number;
  unconfirmedBalance: number;
  isBalanceLoading: boolean;

  // Transactions — aggregated and deduplicated
  transactions: Transaction[];
  isTransactionsLoading: boolean;
  transactionsError: string | null;

  // Send transaction state
  isSending: boolean;
  sendError: string | null;
  lastTxId: string | null;
  transactionPreview: TransactionPreview | null;
  utxos: OwnedUTXO[];

  // Actions
  setNetwork: (network: NetworkType) => void;
  initializeWallet: () => Promise<void>;
  createWallet: () => Promise<string>;
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
  confirmSendTransaction: () => Promise<string>;
  clearSendState: () => void;
}

/**
 * Derive all change addresses from index 0 to nextChangeIndex-1
 */
function deriveChangeAddresses(
  mnemonic: string,
  network: NetworkType,
  nextChangeIndex: number
): string[] {
  const addresses: string[] = [];
  for (let i = 0; i < nextChangeIndex; i++) {
    addresses.push(bitcoinService.getChangeAddress(mnemonic, network, i));
  }
  return addresses;
}

/**
 * Build the list of all owned address derivation info for UTXO fetching
 */
function buildAddressInfos(
  receiveAddress: string,
  changeAddresses: string[]
): AddressDerivationInfo[] {
  const infos: AddressDerivationInfo[] = [{ address: receiveAddress, chain: 0, index: 0 }];
  for (let i = 0; i < changeAddresses.length; i++) {
    infos.push({ address: changeAddresses[i], chain: 1, index: i });
  }
  return infos;
}

/**
 * Get all owned addresses as a flat list
 */
function getAllAddresses(receiveAddress: string, changeAddresses: string[]): string[] {
  return [receiveAddress, ...changeAddresses];
}

/**
 * Scan the internal (change) chain for used addresses during wallet import.
 * Stops after `gapLimit` consecutive addresses with no transaction history.
 */
async function discoverChangeAddresses(
  mnemonic: string,
  network: NetworkType,
  gapLimit: number = 5
): Promise<number> {
  let consecutiveEmpty = 0;
  let index = 0;

  while (consecutiveEmpty < gapLimit) {
    const addr = bitcoinService.getChangeAddress(mnemonic, network, index);
    try {
      const txs = await chainService.getAddressTransactions(addr, network);
      if (txs.length > 0) {
        consecutiveEmpty = 0;
      } else {
        consecutiveEmpty++;
      }
    } catch {
      // If fetching fails, treat as empty
      consecutiveEmpty++;
    }
    index++;
  }

  // nextChangeIndex is the first index in the gap
  return index - gapLimit;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  // Initial state
  isInitialized: false,
  isLoading: false,
  error: null,
  network: "testnet3",
  address: null,
  publicKey: null,
  nextChangeIndex: 0,
  changeAddresses: [],
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
    set({ network, balance: 0, unconfirmedBalance: 0, transactions: [], changeAddresses: [] });
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

          // Load persisted address state
          const addressState = await keyService.getAddressState();
          const nextChangeIndex = addressState?.nextChangeIndex ?? 0;
          const changeAddresses = deriveChangeAddresses(mnemonic, network, nextChangeIndex);

          set({
            isInitialized: true,
            address: info.address,
            publicKey: info.publicKey,
            nextChangeIndex,
            changeAddresses,
          });

          get().fetchBalance();
          get().fetchTransactions();
        }
      }

      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to initialize wallet",
      });
    }
  },

  createWallet: async () => {
    set({ isLoading: true, error: null });

    try {
      const mnemonic = keyService.generateMnemonic();
      await keyService.storeMnemonic(mnemonic);
      await keyService.storeAddressState({ nextChangeIndex: 0 });

      const { network } = get();
      const info = bitcoinService.getWalletInfo(mnemonic, network);

      set({
        isInitialized: true,
        isLoading: false,
        address: info.address,
        publicKey: info.publicKey,
        nextChangeIndex: 0,
        changeAddresses: [],
      });

      get().fetchBalance();
      get().fetchTransactions();

      return mnemonic;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to create wallet",
      });
      throw error;
    }
  },

  importWallet: async (mnemonic: string) => {
    set({ isLoading: true, error: null });

    try {
      if (!keyService.validateMnemonic(mnemonic)) {
        throw new Error("Invalid seed phrase");
      }

      await keyService.storeMnemonic(mnemonic);

      const { network } = get();
      const info = bitcoinService.getWalletInfo(mnemonic, network);

      // Discover used change addresses
      const nextChangeIndex = await discoverChangeAddresses(mnemonic, network);
      await keyService.storeAddressState({ nextChangeIndex });

      const changeAddresses = deriveChangeAddresses(mnemonic, network, nextChangeIndex);

      set({
        isInitialized: true,
        isLoading: false,
        address: info.address,
        publicKey: info.publicKey,
        nextChangeIndex,
        changeAddresses,
      });

      get().fetchBalance();
      get().fetchTransactions();
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to import wallet",
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
        nextChangeIndex: 0,
        changeAddresses: [],
        balance: 0,
        unconfirmedBalance: 0,
        transactions: [],
        transactionsError: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to delete wallet",
      });
      throw error;
    }
  },

  refreshAddress: async () => {
    try {
      const mnemonic = await keyService.getMnemonic();
      if (mnemonic) {
        const { network, nextChangeIndex } = get();
        const info = bitcoinService.getWalletInfo(mnemonic, network);
        const changeAddresses = deriveChangeAddresses(mnemonic, network, nextChangeIndex);
        set({
          address: info.address,
          publicKey: info.publicKey,
          changeAddresses,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to refresh address",
      });
    }
  },

  fetchBalance: async () => {
    const { address, network, changeAddresses } = get();

    if (!address) {
      return;
    }

    set({ isBalanceLoading: true });

    try {
      const allAddresses = getAllAddresses(address, changeAddresses);
      const result = await chainService.getAggregateBalance(allAddresses, network);
      set({
        balance: result.confirmed,
        unconfirmedBalance: result.unconfirmed,
        isBalanceLoading: false,
      });
    } catch (error) {
      set({
        isBalanceLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch balance",
      });
    }
  },

  fetchTransactions: async () => {
    const { address, network, changeAddresses } = get();

    if (!address) {
      return;
    }

    set({ isTransactionsLoading: true, transactionsError: null });

    try {
      const allAddresses = getAllAddresses(address, changeAddresses);
      const transactions = await chainService.getAggregateTransactions(allAddresses, network);
      set({
        transactions,
        isTransactionsLoading: false,
        transactionsError: null,
      });
    } catch (error) {
      set({
        isTransactionsLoading: false,
        transactionsError: error instanceof Error ? error.message : "Failed to fetch transactions",
      });
    }
  },

  prepareSendTransaction: async (recipientAddress: string, amountSats: number) => {
    const { address, network, balance, changeAddresses } = get();

    set({ isSending: true, sendError: null, transactionPreview: null });

    try {
      if (!bitcoinService.isValidAddress(recipientAddress, network)) {
        throw new Error("Invalid recipient address");
      }

      if (amountSats <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      if (!address) {
        throw new Error("Wallet not initialized");
      }

      // Fetch UTXOs across all owned addresses
      const addressInfos = buildAddressInfos(address, changeAddresses);
      const utxos = await chainService.getAggregateUtxos(addressInfos, network);

      if (utxos.length === 0) {
        throw new Error("No UTXOs available");
      }

      const feeRates = await chainService.getRecommendedFees(network);
      const feeRate = feeRates.fastestFee;

      const preview = bitcoinService.prepareTransactionPreview(
        utxos,
        recipientAddress,
        amountSats,
        feeRate
      );

      if (preview.totalSats > balance) {
        throw new Error(`Insufficient funds. Need ${preview.totalSats} sats, have ${balance} sats`);
      }

      set({
        isSending: false,
        transactionPreview: preview,
        utxos,
      });

      return preview;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to prepare transaction";
      set({
        isSending: false,
        sendError: errorMessage,
      });
      throw error;
    }
  },

  confirmSendTransaction: async () => {
    const { address, network, transactionPreview, utxos, nextChangeIndex } = get();

    if (!transactionPreview) {
      throw new Error("No transaction prepared");
    }

    if (!address) {
      throw new Error("Wallet not initialized");
    }

    set({ isSending: true, sendError: null });

    try {
      const mnemonic = await keyService.getMnemonic();
      if (!mnemonic) {
        throw new Error("Wallet not found");
      }

      // Derive a fresh change address for this transaction
      const changeAddress = bitcoinService.getChangeAddress(mnemonic, network, nextChangeIndex);

      // Build and sign with per-input key derivation and change address
      const txHex = bitcoinService.buildAndSignTransaction(
        mnemonic,
        network,
        utxos,
        transactionPreview.recipientAddress,
        transactionPreview.amountSats,
        transactionPreview.feeRate,
        changeAddress
      );

      const txid = await chainService.broadcastTransaction(txHex, network);

      // Advance change index and persist
      const newNextChangeIndex = nextChangeIndex + 1;
      await keyService.storeAddressState({ nextChangeIndex: newNextChangeIndex });

      const changeAddresses = deriveChangeAddresses(mnemonic, network, newNextChangeIndex);

      set({
        isSending: false,
        lastTxId: txid,
        transactionPreview: null,
        utxos: [],
        nextChangeIndex: newNextChangeIndex,
        changeAddresses,
      });

      get().fetchBalance();
      get().fetchTransactions();

      return txid;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send transaction";
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

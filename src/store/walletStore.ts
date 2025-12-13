import { create } from 'zustand';
import { NetworkType } from '@/types/wallet';
import * as keyService from '@/services/keyService';
import * as bitcoinService from '@/services/bitcoinService';
import * as mempoolService from '@/services/mempoolService';

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
  
  // Actions
  setNetwork: (network: NetworkType) => void;
  initializeWallet: () => Promise<void>;
  createWallet: () => Promise<string>; // Returns mnemonic for backup
  importWallet: (mnemonic: string) => Promise<void>;
  deleteWallet: () => Promise<void>;
  refreshAddress: () => Promise<void>;
  fetchBalance: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  // Initial state
  isInitialized: false,
  isLoading: false,
  error: null,
  network: 'testnet4', // Default to testnet4 for safety
  address: null,
  publicKey: null,
  balance: 0,
  unconfirmedBalance: 0,
  isBalanceLoading: false,

  setNetwork: (network: NetworkType) => {
    set({ network, balance: 0, unconfirmedBalance: 0 });
    // Refresh address and balance for new network
    get().refreshAddress();
    get().fetchBalance();
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
          // Fetch balance after initialization
          get().fetchBalance();
        }
      }
      
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize wallet',
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
      
      // Fetch balance (will be 0 for new wallet but good to initialize)
      get().fetchBalance();
      
      // Return mnemonic so user can back it up
      return mnemonic;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create wallet',
      });
      throw error;
    }
  },

  importWallet: async (mnemonic: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Validate mnemonic
      if (!keyService.validateMnemonic(mnemonic)) {
        throw new Error('Invalid seed phrase');
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
      
      // Fetch balance for imported wallet
      get().fetchBalance();
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to import wallet',
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
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete wallet',
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
        error: error instanceof Error ? error.message : 'Failed to refresh address',
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
      const result = await mempoolService.getAddressBalance(address, network);
      set({
        balance: result.confirmed,
        unconfirmedBalance: result.unconfirmed,
        isBalanceLoading: false,
      });
    } catch (error) {
      set({
        isBalanceLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch balance',
      });
    }
  },
}));

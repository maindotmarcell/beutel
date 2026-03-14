import * as SecureStore from "expo-secure-store";
import {
  generateMnemonic as generateBip39Mnemonic,
  validateMnemonic as validateBip39Mnemonic,
} from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

const MNEMONIC_KEY = "beutel_wallet_mnemonic";
const ADDRESS_STATE_KEY = "beutel_address_state";

export interface AddressState {
  nextChangeIndex: number;
}

/**
 * Generate a new 12-word BIP39 mnemonic seed phrase
 */
export function generateMnemonic(): string {
  return generateBip39Mnemonic(wordlist, 128); // 128 bits = 12 words
}

/**
 * Generate a 24-word BIP39 mnemonic seed phrase (stronger security)
 */
export function generateMnemonic24(): string {
  return generateBip39Mnemonic(wordlist, 256); // 256 bits = 24 words
}

/**
 * Validate a BIP39 mnemonic seed phrase
 */
export function validateMnemonic(mnemonic: string): boolean {
  return validateBip39Mnemonic(mnemonic, wordlist);
}

/**
 * Store the mnemonic securely in the device's secure enclave
 * (iOS Keychain / Android Keystore)
 */
export async function storeMnemonic(mnemonic: string): Promise<void> {
  if (!validateMnemonic(mnemonic)) {
    throw new Error("Invalid mnemonic phrase");
  }

  await SecureStore.setItemAsync(MNEMONIC_KEY, mnemonic, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

/**
 * Retrieve the mnemonic from secure storage
 * Returns null if no mnemonic is stored
 */
export async function getMnemonic(): Promise<string | null> {
  return SecureStore.getItemAsync(MNEMONIC_KEY);
}

/**
 * Delete the mnemonic from secure storage (wipe wallet)
 */
export async function deleteMnemonic(): Promise<void> {
  await SecureStore.deleteItemAsync(MNEMONIC_KEY);
  await deleteAddressState();
}

/**
 * Get the persisted address state (change index tracking)
 */
export async function getAddressState(): Promise<AddressState | null> {
  const raw = await SecureStore.getItemAsync(ADDRESS_STATE_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as AddressState;
}

/**
 * Persist address state (change index tracking)
 */
export async function storeAddressState(state: AddressState): Promise<void> {
  await SecureStore.setItemAsync(ADDRESS_STATE_KEY, JSON.stringify(state), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

/**
 * Delete persisted address state
 */
export async function deleteAddressState(): Promise<void> {
  await SecureStore.deleteItemAsync(ADDRESS_STATE_KEY);
}

/**
 * Check if a wallet (mnemonic) exists in secure storage
 */
export async function hasMnemonic(): Promise<boolean> {
  const mnemonic = await getMnemonic();
  return mnemonic !== null;
}

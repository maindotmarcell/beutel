import { HDKey } from "@scure/bip32";
import { mnemonicToSeedSync } from "@scure/bip39";
import * as btc from "@scure/btc-signer";
import { signSchnorr } from "@scure/btc-signer/utils.js";
import { hex } from "@scure/base";
import { NetworkType } from "@/types/wallet";

// Bitcoin network configurations
const NETWORKS = {
  mainnet: btc.NETWORK,
  testnet3: btc.TEST_NETWORK,
  testnet4: btc.TEST_NETWORK,
  signet: btc.TEST_NETWORK,
} as const;

/**
 * BIP86 derivation paths for Taproot
 * m/86'/coin'/account'/change/index
 * coin: 0 for mainnet, 1 for testnet/testnet4/signet
 */
function getDerivationPath(
  network: NetworkType,
  accountIndex: number = 0,
  addressIndex: number = 0
): string {
  const coinType = network === "mainnet" ? 0 : 1;
  return `m/86'/${coinType}'/${accountIndex}'/0/${addressIndex}`;
}

/**
 * Derive the master HD key from a mnemonic
 */
function getMasterKey(mnemonic: string): HDKey {
  const seed = mnemonicToSeedSync(mnemonic);
  return HDKey.fromMasterSeed(seed);
}

/**
 * Derive a private key at a specific BIP86 path for Taproot
 */
export function derivePrivateKey(
  mnemonic: string,
  network: NetworkType,
  accountIndex: number = 0,
  addressIndex: number = 0
): Uint8Array {
  const masterKey = getMasterKey(mnemonic);
  const path = getDerivationPath(network, accountIndex, addressIndex);
  const child = masterKey.derive(path);

  if (!child.privateKey) {
    throw new Error("Failed to derive private key");
  }

  return child.privateKey;
}

/**
 * Get the public key from a private key
 */
export function getPublicKey(privateKey: Uint8Array): Uint8Array {
  const p2tr = btc.p2tr(privateKey, undefined, NETWORKS.mainnet);
  // For Taproot, we use the x-only public key (32 bytes)
  return p2tr.tweakedPubkey;
}

/**
 * Generate a Taproot (P2TR) address from a mnemonic
 */
export function getAddress(
  mnemonic: string,
  network: NetworkType,
  accountIndex: number = 0,
  addressIndex: number = 0
): string {
  const privateKey = derivePrivateKey(
    mnemonic,
    network,
    accountIndex,
    addressIndex
  );
  const networkConfig = NETWORKS[network];

  // Create P2TR (Taproot) output
  const p2tr = btc.p2tr(privateKey, undefined, networkConfig);

  if (!p2tr.address) {
    throw new Error("Failed to generate address");
  }

  return p2tr.address;
}

/**
 * Get the x-only public key (for Taproot) as hex string
 */
export function getPublicKeyHex(
  mnemonic: string,
  network: NetworkType,
  accountIndex: number = 0,
  addressIndex: number = 0
): string {
  const privateKey = derivePrivateKey(
    mnemonic,
    network,
    accountIndex,
    addressIndex
  );
  const networkConfig = NETWORKS[network];
  const p2tr = btc.p2tr(privateKey, undefined, networkConfig);

  return hex.encode(p2tr.tweakedPubkey);
}

/**
 * Sign a message using Schnorr signature (BIP340) for Taproot
 */
export function signMessage(
  message: Uint8Array,
  privateKey: Uint8Array
): Uint8Array {
  // Use schnorr signature for Taproot
  return signSchnorr(message, privateKey);
}

/**
 * Get wallet info (address and public key) for display
 */
export function getWalletInfo(
  mnemonic: string,
  network: NetworkType,
  accountIndex: number = 0,
  addressIndex: number = 0
): { address: string; publicKey: string } {
  return {
    address: getAddress(mnemonic, network, accountIndex, addressIndex),
    publicKey: getPublicKeyHex(mnemonic, network, accountIndex, addressIndex),
  };
}

/**
 * Validate a Bitcoin address for the given network
 */
export function isValidAddress(address: string, network: NetworkType): boolean {
  try {
    const networkConfig = NETWORKS[network];
    // Try to decode the address - will throw if invalid
    btc.Address(networkConfig).decode(address);
    return true;
  } catch {
    return false;
  }
}

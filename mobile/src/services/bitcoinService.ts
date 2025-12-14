import { HDKey } from "@scure/bip32";
import { mnemonicToSeedSync } from "@scure/bip39";
import * as btc from "@scure/btc-signer";
import { signSchnorr } from "@scure/btc-signer/utils.js";
import { hex } from "@scure/base";
import { NetworkType, UTXO, TransactionPreview } from "@/types/wallet";

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
 * Derive key pair (private key and x-only public key) at a specific BIP86 path for Taproot
 */
function deriveKeyPair(
  mnemonic: string,
  network: NetworkType,
  accountIndex: number = 0,
  addressIndex: number = 0
): { privateKey: Uint8Array; xOnlyPubKey: Uint8Array } {
  const masterKey = getMasterKey(mnemonic);
  const path = getDerivationPath(network, accountIndex, addressIndex);
  const child = masterKey.derive(path);

  if (!child.privateKey || !child.publicKey) {
    throw new Error("Failed to derive key pair");
  }

  // Get x-only public key (32 bytes) by removing the prefix from compressed public key (33 bytes)
  const xOnlyPubKey = child.publicKey.slice(1);

  return {
    privateKey: child.privateKey,
    xOnlyPubKey,
  };
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
  return deriveKeyPair(mnemonic, network, accountIndex, addressIndex).privateKey;
}

/**
 * Get the x-only public key from a mnemonic for Taproot
 */
export function getPublicKey(
  mnemonic: string,
  network: NetworkType,
  accountIndex: number = 0,
  addressIndex: number = 0
): Uint8Array {
  return deriveKeyPair(mnemonic, network, accountIndex, addressIndex).xOnlyPubKey;
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
  const { xOnlyPubKey } = deriveKeyPair(mnemonic, network, accountIndex, addressIndex);
  const networkConfig = NETWORKS[network];

  // Create P2TR (Taproot) output using the x-only public key
  const p2tr = btc.p2tr(xOnlyPubKey, undefined, networkConfig);

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
  const { xOnlyPubKey } = deriveKeyPair(mnemonic, network, accountIndex, addressIndex);
  const networkConfig = NETWORKS[network];
  const p2tr = btc.p2tr(xOnlyPubKey, undefined, networkConfig);

  return hex.encode(p2tr.tweakedPubkey);
}

/**
 * Sign a message using Schnorr signature (BIP340) for Taproot
 */
export function signMessage(message: Uint8Array, privateKey: Uint8Array): Uint8Array {
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

// Taproot transaction size estimation (vbytes)
const P2TR_INPUT_VBYTES = 58; // P2TR key-path spend input
const P2TR_OUTPUT_VBYTES = 43; // P2TR output
const TX_OVERHEAD_VBYTES = 10.5; // Transaction overhead

/**
 * Estimate transaction size in virtual bytes for fee calculation
 */
export function estimateTxVbytes(inputCount: number, outputCount: number): number {
  return Math.ceil(
    TX_OVERHEAD_VBYTES + inputCount * P2TR_INPUT_VBYTES + outputCount * P2TR_OUTPUT_VBYTES
  );
}

/**
 * Select UTXOs using largest-first strategy
 * Returns selected UTXOs and total value
 */
export function selectUtxos(
  utxos: UTXO[],
  targetAmount: number,
  feeRate: number
): { selected: UTXO[]; totalValue: number; fee: number } {
  // Sort UTXOs by value (largest first)
  const sorted = [...utxos].sort((a, b) => b.value - a.value);

  const selected: UTXO[] = [];
  let totalValue = 0;

  for (const utxo of sorted) {
    selected.push(utxo);
    totalValue += utxo.value;

    // Calculate fee with current input count (2 outputs: recipient + change)
    const estimatedVbytes = estimateTxVbytes(selected.length, 2);
    const estimatedFee = Math.ceil(estimatedVbytes * feeRate);

    // Check if we have enough to cover amount + fee
    if (totalValue >= targetAmount + estimatedFee) {
      return { selected, totalValue, fee: estimatedFee };
    }
  }

  // Not enough funds
  const finalVbytes = estimateTxVbytes(selected.length, 2);
  const finalFee = Math.ceil(finalVbytes * feeRate);
  return { selected, totalValue, fee: finalFee };
}

/**
 * Prepare a transaction preview (for confirmation screen)
 */
export function prepareTransactionPreview(
  utxos: UTXO[],
  recipientAddress: string,
  amountSats: number,
  feeRate: number
): TransactionPreview {
  const { selected, totalValue, fee } = selectUtxos(utxos, amountSats, feeRate);

  const changeAmount = totalValue - amountSats - fee;

  return {
    recipientAddress,
    amountSats,
    feeSats: fee,
    totalSats: amountSats + fee,
    feeRate,
    inputCount: selected.length,
    changeAmount: changeAmount > 0 ? changeAmount : 0,
  };
}

/**
 * Build and sign a Taproot transaction
 * @returns The signed transaction hex
 */
export function buildAndSignTransaction(
  mnemonic: string,
  network: NetworkType,
  utxos: UTXO[],
  recipientAddress: string,
  amountSats: number,
  feeRate: number,
  senderAddress: string
): string {
  const networkConfig = NETWORKS[network];

  // Get both private key and x-only public key
  const { privateKey, xOnlyPubKey } = deriveKeyPair(mnemonic, network);

  // Create P2TR spend info using the x-only public key
  const p2tr = btc.p2tr(xOnlyPubKey, undefined, networkConfig);

  // Select UTXOs
  const { selected, totalValue, fee } = selectUtxos(utxos, amountSats, feeRate);

  // Verify we have enough funds
  if (totalValue < amountSats + fee) {
    throw new Error(`Insufficient funds. Need ${amountSats + fee} sats, have ${totalValue} sats`);
  }

  // Calculate change
  const changeAmount = totalValue - amountSats - fee;

  // Build the transaction
  const tx = new btc.Transaction();

  // Add inputs with proper Taproot key-path spend data
  for (const utxo of selected) {
    tx.addInput({
      txid: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        script: p2tr.script,
        amount: BigInt(utxo.value),
      },
      tapInternalKey: xOnlyPubKey,
    });
  }

  // Add recipient output
  tx.addOutputAddress(recipientAddress, BigInt(amountSats), networkConfig);

  // Add change output if there's change (dust threshold ~546 sats for P2TR)
  if (changeAmount > 546) {
    tx.addOutputAddress(senderAddress, BigInt(changeAmount), networkConfig);
  }

  // Sign all inputs with the private key
  tx.sign(privateKey);

  // Finalize the transaction
  tx.finalize();

  // Return the hex
  return hex.encode(tx.extract());
}

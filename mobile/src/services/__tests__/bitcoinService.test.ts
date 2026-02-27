import {
  getAddress,
  getPublicKeyHex,
  getWalletInfo,
  isValidAddress,
  estimateTxVbytes,
  selectUtxos,
  prepareTransactionPreview,
  buildAndSignTransaction,
} from "../bitcoinService";
import { UTXO } from "@/types/wallet";

// Known test mnemonic — NOT used for real funds
const TEST_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

const makeUtxo = (value: number, index = 0): UTXO => ({
  txid: "a".repeat(64),
  vout: index,
  value,
  status: { confirmed: true },
});

describe("getAddress", () => {
  it("derives a testnet4 Taproot address starting with tb1p", () => {
    const address = getAddress(TEST_MNEMONIC, "testnet4");
    expect(address).toMatch(/^tb1p/);
  });

  it("derives a mainnet Taproot address starting with bc1p", () => {
    const address = getAddress(TEST_MNEMONIC, "mainnet");
    expect(address).toMatch(/^bc1p/);
  });

  it("returns a deterministic address for the same mnemonic", () => {
    const a1 = getAddress(TEST_MNEMONIC, "testnet4");
    const a2 = getAddress(TEST_MNEMONIC, "testnet4");
    expect(a1).toBe(a2);
  });
});

describe("getPublicKeyHex", () => {
  it("returns a 64-character hex string", () => {
    const pubkey = getPublicKeyHex(TEST_MNEMONIC, "testnet4");
    expect(pubkey).toHaveLength(64);
    expect(pubkey).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("getWalletInfo", () => {
  it("returns both address and publicKey", () => {
    const info = getWalletInfo(TEST_MNEMONIC, "testnet4");
    expect(info.address).toMatch(/^tb1p/);
    expect(info.publicKey).toHaveLength(64);
  });
});

describe("isValidAddress", () => {
  it("accepts a valid testnet Taproot address", () => {
    const address = getAddress(TEST_MNEMONIC, "testnet4");
    expect(isValidAddress(address, "testnet4")).toBe(true);
  });

  it("accepts a valid mainnet Taproot address", () => {
    const address = getAddress(TEST_MNEMONIC, "mainnet");
    expect(isValidAddress(address, "mainnet")).toBe(true);
  });

  it("rejects garbage input", () => {
    expect(isValidAddress("notanaddress", "mainnet")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidAddress("", "testnet4")).toBe(false);
  });
});

describe("estimateTxVbytes", () => {
  it("estimates a 1-in 2-out transaction", () => {
    const vbytes = estimateTxVbytes(1, 2);
    // 10.5 + 58 + 86 = 154.5 → 155
    expect(vbytes).toBe(155);
  });

  it("increases with more inputs", () => {
    const one = estimateTxVbytes(1, 2);
    const two = estimateTxVbytes(2, 2);
    expect(two - one).toBe(58); // P2TR_INPUT_VBYTES
  });

  it("increases with more outputs", () => {
    const two = estimateTxVbytes(1, 2);
    const three = estimateTxVbytes(1, 3);
    expect(three - two).toBe(43); // P2TR_OUTPUT_VBYTES
  });
});

describe("selectUtxos", () => {
  it("selects a single UTXO when it covers amount + fee", () => {
    const utxos = [makeUtxo(100_000), makeUtxo(50_000, 1)];
    const { selected, totalValue } = selectUtxos(utxos, 10_000, 5);
    expect(selected).toHaveLength(1);
    expect(totalValue).toBe(100_000);
  });

  it("selects multiple UTXOs when needed", () => {
    const utxos = [makeUtxo(30_000), makeUtxo(30_000, 1), makeUtxo(30_000, 2)];
    const { selected } = selectUtxos(utxos, 55_000, 1);
    expect(selected.length).toBeGreaterThanOrEqual(2);
  });

  it("returns all UTXOs when funds are insufficient", () => {
    const utxos = [makeUtxo(1_000), makeUtxo(1_000, 1)];
    const { selected, totalValue, fee } = selectUtxos(utxos, 1_000_000, 5);
    expect(selected).toHaveLength(2);
    expect(totalValue).toBeLessThan(1_000_000 + fee);
  });

  it("prefers largest UTXOs first", () => {
    const utxos = [makeUtxo(10_000), makeUtxo(50_000, 1), makeUtxo(20_000, 2)];
    const { selected } = selectUtxos(utxos, 5_000, 1);
    expect(selected[0].value).toBe(50_000);
  });
});

describe("prepareTransactionPreview", () => {
  it("calculates fee, change, and total correctly", () => {
    const utxos = [makeUtxo(100_000)];
    const preview = prepareTransactionPreview(utxos, "tb1qfake", 50_000, 10);

    expect(preview.amountSats).toBe(50_000);
    expect(preview.feeSats).toBeGreaterThan(0);
    expect(preview.totalSats).toBe(50_000 + preview.feeSats);
    expect(preview.changeAmount).toBe(100_000 - 50_000 - preview.feeSats);
    expect(preview.inputCount).toBe(1);
    expect(preview.feeRate).toBe(10);
  });

  it("sets change to 0 when insufficient funds", () => {
    const utxos = [makeUtxo(1_000)];
    const preview = prepareTransactionPreview(utxos, "tb1qfake", 1_000_000, 10);
    expect(preview.changeAmount).toBe(0);
  });
});

describe("buildAndSignTransaction", () => {
  it("builds and signs a testnet transaction, returning hex", () => {
    const senderAddress = getAddress(TEST_MNEMONIC, "testnet4");

    // Use a real-looking UTXO that we "own"
    const utxos: UTXO[] = [
      {
        txid: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        vout: 0,
        value: 100_000,
        status: { confirmed: true },
      },
    ];

    // Send to another valid testnet taproot address (derived from different index)
    const recipientAddress = getAddress(TEST_MNEMONIC, "testnet4", 0, 1);

    const txHex = buildAndSignTransaction(
      TEST_MNEMONIC,
      "testnet4",
      utxos,
      recipientAddress,
      10_000,
      5,
      senderAddress
    );

    expect(typeof txHex).toBe("string");
    expect(txHex.length).toBeGreaterThan(0);
    // Valid hex
    expect(txHex).toMatch(/^[0-9a-f]+$/);
  });

  it("throws when funds are insufficient", () => {
    const senderAddress = getAddress(TEST_MNEMONIC, "testnet4");
    const recipientAddress = getAddress(TEST_MNEMONIC, "testnet4", 0, 1);
    const utxos: UTXO[] = [makeUtxo(1_000)];

    expect(() =>
      buildAndSignTransaction(
        TEST_MNEMONIC,
        "testnet4",
        utxos,
        recipientAddress,
        1_000_000,
        5,
        senderAddress
      )
    ).toThrow("Insufficient funds");
  });
});

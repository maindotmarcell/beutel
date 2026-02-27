import * as SecureStore from "expo-secure-store";
import {
  generateMnemonic,
  generateMnemonic24,
  validateMnemonic,
  storeMnemonic,
  getMnemonic,
  hasMnemonic,
  deleteMnemonic,
} from "../keyService";

// Access the mock's internal store for cleanup
const mockStore = SecureStore as unknown as {
  __store: Record<string, string>;
  __clear: () => void;
};

beforeEach(() => {
  mockStore.__clear();
  jest.clearAllMocks();
});

describe("generateMnemonic", () => {
  it("returns 12 words", () => {
    const mnemonic = generateMnemonic();
    const words = mnemonic.split(" ");
    expect(words).toHaveLength(12);
  });

  it("generates a valid BIP39 mnemonic", () => {
    const mnemonic = generateMnemonic();
    expect(validateMnemonic(mnemonic)).toBe(true);
  });
});

describe("generateMnemonic24", () => {
  it("returns 24 words", () => {
    const mnemonic = generateMnemonic24();
    const words = mnemonic.split(" ");
    expect(words).toHaveLength(24);
  });

  it("generates a valid BIP39 mnemonic", () => {
    const mnemonic = generateMnemonic24();
    expect(validateMnemonic(mnemonic)).toBe(true);
  });
});

describe("validateMnemonic", () => {
  it("returns true for a valid mnemonic", () => {
    const valid =
      "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
    expect(validateMnemonic(valid)).toBe(true);
  });

  it("returns false for garbage", () => {
    expect(validateMnemonic("hello world foo bar")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(validateMnemonic("")).toBe(false);
  });
});

describe("storeMnemonic", () => {
  it("rejects an invalid mnemonic", async () => {
    await expect(storeMnemonic("not a valid mnemonic")).rejects.toThrow("Invalid mnemonic phrase");
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it("stores a valid mnemonic", async () => {
    const mnemonic = generateMnemonic();
    await storeMnemonic(mnemonic);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "beutel_wallet_mnemonic",
      mnemonic,
      expect.any(Object)
    );
  });
});

describe("getMnemonic / hasMnemonic / deleteMnemonic", () => {
  it("round-trips: store → get → has → delete → has", async () => {
    const mnemonic = generateMnemonic();

    // Initially empty
    expect(await hasMnemonic()).toBe(false);
    expect(await getMnemonic()).toBeNull();

    // Store
    await storeMnemonic(mnemonic);

    // Retrieve
    expect(await hasMnemonic()).toBe(true);
    expect(await getMnemonic()).toBe(mnemonic);

    // Delete
    await deleteMnemonic();
    expect(await hasMnemonic()).toBe(false);
    expect(await getMnemonic()).toBeNull();
  });
});

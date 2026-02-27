import { getAddressTransactions } from "../chainService";
import * as mempoolApi from "@/api/chainApi";
import { TransactionResponse } from "@/types/api";

jest.mock("@/api/chainApi");

const mockedApi = mempoolApi as jest.Mocked<typeof mempoolApi>;

const TEST_ADDRESS = "tb1pfakeaddress";

const makeTxResponse = (overrides: Partial<TransactionResponse> = {}): TransactionResponse => ({
  txid: "abc123",
  type: "receive",
  amountSats: 50_000,
  otherAddr: "tb1psender",
  confirmed: true,
  blockHeight: 100,
  blockTime: 1700000000,
  feeSats: 500,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getAddressTransactions", () => {
  it("converts timestamps from unix seconds to Date objects", async () => {
    mockedApi.getAddressTransactions.mockResolvedValue([
      makeTxResponse({ blockTime: 1700000000 }),
    ]);

    const txs = await getAddressTransactions(TEST_ADDRESS, "testnet4");
    expect(txs[0].timestamp).toEqual(new Date(1700000000 * 1000));
  });

  it("converts amounts from satoshis to BTC", async () => {
    mockedApi.getAddressTransactions.mockResolvedValue([
      makeTxResponse({ amountSats: 100_000_000, feeSats: 1_000 }),
    ]);

    const txs = await getAddressTransactions(TEST_ADDRESS, "testnet4");
    expect(txs[0].amount).toBe(1); // 1 BTC
    expect(txs[0].fee).toBe(0.00001); // 1000 sats
  });

  it("maps confirmed status correctly", async () => {
    mockedApi.getAddressTransactions.mockResolvedValue([
      makeTxResponse({ confirmed: true }),
      makeTxResponse({ txid: "def456", confirmed: false }),
    ]);

    const txs = await getAddressTransactions(TEST_ADDRESS, "testnet4");
    const confirmed = txs.find((t) => t.id === "abc123");
    const pending = txs.find((t) => t.id === "def456");
    expect(confirmed?.status).toBe("confirmed");
    expect(pending?.status).toBe("pending");
  });

  it("sorts transactions newest-first", async () => {
    mockedApi.getAddressTransactions.mockResolvedValue([
      makeTxResponse({ txid: "old", blockTime: 1600000000 }),
      makeTxResponse({ txid: "new", blockTime: 1700000000 }),
    ]);

    const txs = await getAddressTransactions(TEST_ADDRESS, "testnet4");
    expect(txs[0].id).toBe("new");
    expect(txs[1].id).toBe("old");
  });

  it("uses current date when blockTime is missing", async () => {
    const before = Date.now();
    mockedApi.getAddressTransactions.mockResolvedValue([
      makeTxResponse({ blockTime: undefined }),
    ]);

    const txs = await getAddressTransactions(TEST_ADDRESS, "testnet4");
    const after = Date.now();
    expect(txs[0].timestamp.getTime()).toBeGreaterThanOrEqual(before);
    expect(txs[0].timestamp.getTime()).toBeLessThanOrEqual(after);
  });

  it("falls back to own address when otherAddr is empty", async () => {
    mockedApi.getAddressTransactions.mockResolvedValue([
      makeTxResponse({ otherAddr: "" }),
    ]);

    const txs = await getAddressTransactions(TEST_ADDRESS, "testnet4");
    expect(txs[0].address).toBe(TEST_ADDRESS);
  });

  it("sets transactionType to on-chain", async () => {
    mockedApi.getAddressTransactions.mockResolvedValue([makeTxResponse()]);

    const txs = await getAddressTransactions(TEST_ADDRESS, "testnet4");
    expect(txs[0].transactionType).toBe("on-chain");
  });
});

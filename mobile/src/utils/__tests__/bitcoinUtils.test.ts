import { satsToBtc, btcToSats } from "../bitcoinUtils";

describe("satsToBtc", () => {
  it("converts 100_000_000 sats to 1 BTC", () => {
    expect(satsToBtc(100_000_000)).toBe(1);
  });

  it("converts 1 sat to 0.00000001 BTC", () => {
    expect(satsToBtc(1)).toBe(0.00000001);
  });

  it("converts 0 sats to 0 BTC", () => {
    expect(satsToBtc(0)).toBe(0);
  });

  it("converts 50_000 sats to 0.0005 BTC", () => {
    expect(satsToBtc(50_000)).toBe(0.0005);
  });
});

describe("btcToSats", () => {
  it("converts 1 BTC to 100_000_000 sats", () => {
    expect(btcToSats(1)).toBe(100_000_000);
  });

  it("converts 0.00000001 BTC to 1 sat", () => {
    expect(btcToSats(0.00000001)).toBe(1);
  });

  it("converts 0 BTC to 0 sats", () => {
    expect(btcToSats(0)).toBe(0);
  });

  it("rounds fractional satoshis", () => {
    // 0.000000005 BTC = 0.5 sats → rounds to 1
    expect(btcToSats(0.000000005)).toBe(1);
    // 0.123456789 BTC = 12345678.9 → rounds to 12345679
    expect(btcToSats(0.123456789)).toBe(12345679);
  });
});

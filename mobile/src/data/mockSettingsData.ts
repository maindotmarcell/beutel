import { SettingsData } from "@/types/settings";

export const mockSettingsData: SettingsData = {
  profile: {
    name: "John Doe",
    email: "john.doe@example.com",
    walletAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  },
  security: {
    twoFactorAuth: true,
    biometricAuth: true,
    autoLock: true,
    autoLockTimeout: 5,
  },
  notifications: {
    transactionAlerts: true,
    priceAlerts: false,
    securityAlerts: true,
    marketingEmails: false,
  },
  appInfo: {
    version: "1.0.0",
    buildNumber: "100",
    lastUpdated: new Date("2024-01-15"),
  },
};

export interface UserProfile {
  name: string;
  email: string;
  walletAddress: string;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  biometricAuth: boolean;
  autoLock: boolean;
  autoLockTimeout: number; // in minutes
}

export interface NotificationSettings {
  transactionAlerts: boolean;
  priceAlerts: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
}

export interface AppInfo {
  version: string;
  buildNumber: string;
  lastUpdated: Date;
}

export interface SettingsData {
  profile: UserProfile;
  security: SecuritySettings;
  notifications: NotificationSettings;
  appInfo: AppInfo;
}

export const mockSettingsData: SettingsData = {
  profile: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
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
    version: '1.0.0',
    buildNumber: '100',
    lastUpdated: new Date('2024-01-15'),
  },
};


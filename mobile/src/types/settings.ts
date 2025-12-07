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


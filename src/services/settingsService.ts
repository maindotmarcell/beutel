import {
  UserProfile,
  SecuritySettings,
  NotificationSettings,
  AppInfo,
} from '@/types/settings';
import { mockSettingsData } from '@/data/mockSettingsData';

export function getUserProfile(): UserProfile {
  return mockSettingsData.profile;
}

export function getSecuritySettings(): SecuritySettings {
  return mockSettingsData.security;
}

export function getNotificationSettings(): NotificationSettings {
  return mockSettingsData.notifications;
}

export function getAppInfo(): AppInfo {
  return mockSettingsData.appInfo;
}

export function getReceiveAddress(): string {
  return mockSettingsData.profile.walletAddress;
}


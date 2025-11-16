import { View, ScrollView, TouchableOpacity, Switch } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Navbar from "../components/Navbar";
import Text from "../components/Text";
import { mockSettingsData } from "../data/mockSettingsData";

interface SettingsScreenProps {
  onBackPress?: () => void;
}

export default function SettingsScreen({ onBackPress }: SettingsScreenProps) {
  const formatAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-theme-background" edges={[]}>
      <StatusBar style="dark" />
      <View className="flex-1">
        {/* Navbar */}
        <Navbar onBackPress={onBackPress} />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View className="px-4 py-6">
            <Text className="text-lg font-semibold text-theme-text-primary mb-4">
              Account
            </Text>
            <View className="bg-theme-surface rounded-xl border border-theme-border overflow-hidden">
              <View className="px-4 py-4 border-b border-theme-border">
                <Text className="text-xs text-theme-text-muted mb-1">Name</Text>
                <Text className="text-base text-theme-text-primary font-medium">
                  {mockSettingsData.profile.name}
                </Text>
              </View>
              <View className="px-4 py-4 border-b border-theme-border">
                <Text className="text-xs text-theme-text-muted mb-1">
                  Email
                </Text>
                <Text className="text-base text-theme-text-primary font-medium">
                  {mockSettingsData.profile.email}
                </Text>
              </View>
              <View className="px-4 py-4">
                <Text className="text-xs text-theme-text-muted mb-1">
                  Wallet Address
                </Text>
                <Text className="text-base text-theme-text-primary font-mono">
                  {formatAddress(mockSettingsData.profile.walletAddress)}
                </Text>
              </View>
            </View>
          </View>

          {/* Security Section */}
          <View className="px-4 pb-6">
            <Text className="text-lg font-semibold text-theme-text-primary mb-4">
              Security
            </Text>
            <View className="bg-theme-surface rounded-xl border border-theme-border overflow-hidden">
              <View className="px-4 py-4 border-b border-theme-border flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base text-theme-text-primary font-medium mb-1">
                    Two-Factor Authentication
                  </Text>
                  <Text className="text-sm text-theme-text-secondary">
                    {mockSettingsData.security.twoFactorAuth
                      ? "Enabled"
                      : "Disabled"}
                  </Text>
                </View>
                <Switch
                  value={mockSettingsData.security.twoFactorAuth}
                  disabled
                  trackColor={{ false: "#e5e7eb", true: "#9333ea" }}
                  thumbColor={
                    mockSettingsData.security.twoFactorAuth
                      ? "#ffffff"
                      : "#f4f3f4"
                  }
                />
              </View>
              <View className="px-4 py-4 border-b border-theme-border flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base text-theme-text-primary font-medium mb-1">
                    Biometric Authentication
                  </Text>
                  <Text className="text-sm text-theme-text-secondary">
                    {mockSettingsData.security.biometricAuth
                      ? "Enabled"
                      : "Disabled"}
                  </Text>
                </View>
                <Switch
                  value={mockSettingsData.security.biometricAuth}
                  disabled
                  trackColor={{ false: "#e5e7eb", true: "#9333ea" }}
                  thumbColor={
                    mockSettingsData.security.biometricAuth
                      ? "#ffffff"
                      : "#f4f3f4"
                  }
                />
              </View>
              <View className="px-4 py-4 border-b border-theme-border flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base text-theme-text-primary font-medium mb-1">
                    Auto Lock
                  </Text>
                  <Text className="text-sm text-theme-text-secondary">
                    {mockSettingsData.security.autoLock
                      ? `Lock after ${mockSettingsData.security.autoLockTimeout} minutes`
                      : "Disabled"}
                  </Text>
                </View>
                <Switch
                  value={mockSettingsData.security.autoLock}
                  disabled
                  trackColor={{ false: "#e5e7eb", true: "#9333ea" }}
                  thumbColor={
                    mockSettingsData.security.autoLock ? "#ffffff" : "#f4f3f4"
                  }
                />
              </View>
            </View>
          </View>

          {/* Notifications Section */}
          <View className="px-4 pb-6">
            <Text className="text-lg font-semibold text-theme-text-primary mb-4">
              Notifications
            </Text>
            <View className="bg-theme-surface rounded-xl border border-theme-border overflow-hidden">
              <View className="px-4 py-4 border-b border-theme-border flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base text-theme-text-primary font-medium mb-1">
                    Transaction Alerts
                  </Text>
                  <Text className="text-sm text-theme-text-secondary">
                    Get notified about transactions
                  </Text>
                </View>
                <Switch
                  value={mockSettingsData.notifications.transactionAlerts}
                  disabled
                  trackColor={{ false: "#e5e7eb", true: "#9333ea" }}
                  thumbColor={
                    mockSettingsData.notifications.transactionAlerts
                      ? "#ffffff"
                      : "#f4f3f4"
                  }
                />
              </View>
              <View className="px-4 py-4 border-b border-theme-border flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base text-theme-text-primary font-medium mb-1">
                    Price Alerts
                  </Text>
                  <Text className="text-sm text-theme-text-secondary">
                    Get notified about price changes
                  </Text>
                </View>
                <Switch
                  value={mockSettingsData.notifications.priceAlerts}
                  disabled
                  trackColor={{ false: "#e5e7eb", true: "#9333ea" }}
                  thumbColor={
                    mockSettingsData.notifications.priceAlerts
                      ? "#ffffff"
                      : "#f4f3f4"
                  }
                />
              </View>
              <View className="px-4 py-4 border-b border-theme-border flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base text-theme-text-primary font-medium mb-1">
                    Security Alerts
                  </Text>
                  <Text className="text-sm text-theme-text-secondary">
                    Get notified about security events
                  </Text>
                </View>
                <Switch
                  value={mockSettingsData.notifications.securityAlerts}
                  disabled
                  trackColor={{ false: "#e5e7eb", true: "#9333ea" }}
                  thumbColor={
                    mockSettingsData.notifications.securityAlerts
                      ? "#ffffff"
                      : "#f4f3f4"
                  }
                />
              </View>
              <View className="px-4 py-4 flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base text-theme-text-primary font-medium mb-1">
                    Marketing Emails
                  </Text>
                  <Text className="text-sm text-theme-text-secondary">
                    Receive promotional content
                  </Text>
                </View>
                <Switch
                  value={mockSettingsData.notifications.marketingEmails}
                  disabled
                  trackColor={{ false: "#e5e7eb", true: "#9333ea" }}
                  thumbColor={
                    mockSettingsData.notifications.marketingEmails
                      ? "#ffffff"
                      : "#f4f3f4"
                  }
                />
              </View>
            </View>
          </View>

          {/* About Section */}
          <View className="px-4 pb-6">
            <Text className="text-lg font-semibold text-theme-text-primary mb-4">
              About
            </Text>
            <View className="bg-theme-surface rounded-xl border border-theme-border overflow-hidden">
              <View className="px-4 py-4 border-b border-theme-border">
                <Text className="text-xs text-theme-text-muted mb-1">
                  Version
                </Text>
                <Text className="text-base text-theme-text-primary font-medium">
                  {mockSettingsData.appInfo.version} (
                  {mockSettingsData.appInfo.buildNumber})
                </Text>
              </View>
              <View className="px-4 py-4">
                <Text className="text-xs text-theme-text-muted mb-1">
                  Last Updated
                </Text>
                <Text className="text-base text-theme-text-primary font-medium">
                  {formatDate(mockSettingsData.appInfo.lastUpdated)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

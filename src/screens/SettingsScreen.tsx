import { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Navbar from "@/components/Navbar";
import Text from "@/components/Text";
import {
  getUserProfile,
  getSecuritySettings,
  getNotificationSettings,
  getAppInfo,
} from "@/services";
import { useNavigationStore } from "@/store/navigationStore";
import { useWalletStore } from "@/store/walletStore";

export default function SettingsScreen() {
  const profile = getUserProfile();
  const security = getSecuritySettings();
  const notifications = getNotificationSettings();
  const appInfo = getAppInfo();

  const { importWallet, address, isLoading } = useWalletStore();

  const [showImportModal, setShowImportModal] = useState(false);
  const [seedPhraseInput, setSeedPhraseInput] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleImportSeedPhrase = async () => {
    setImportError(null);
    setImportSuccess(false);

    // Clean up the seed phrase - trim whitespace and normalize spaces
    const cleanedPhrase = seedPhraseInput.trim().toLowerCase().replace(/\s+/g, " ");

    // Basic validation
    const words = cleanedPhrase.split(" ");
    if (words.length !== 12 && words.length !== 24) {
      setImportError("Seed phrase must be 12 or 24 words");
      return;
    }

    setIsImporting(true);

    try {
      await importWallet(cleanedPhrase);
      setImportSuccess(true);
      setSeedPhraseInput("");
      // Close modal after a short delay to show success
      setTimeout(() => {
        setShowImportModal(false);
        setImportSuccess(false);
      }, 1500);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Failed to import wallet");
    } finally {
      setIsImporting(false);
    }
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setSeedPhraseInput("");
    setImportError(null);
    setImportSuccess(false);
  };

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
        <Navbar title="Settings" showCloseButton={true} />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View className="px-4 py-6">
            <Text className="text-lg font-semibold text-theme-text-primary mb-4">Account</Text>
            <View className="bg-theme-surface rounded-xl border border-theme-border overflow-hidden">
              <View className="px-4 py-4 border-b border-theme-border">
                <Text className="text-xs text-theme-text-muted mb-1">Name</Text>
                <Text className="text-base text-theme-text-primary font-medium">
                  {profile.name}
                </Text>
              </View>
              <View className="px-4 py-4 border-b border-theme-border">
                <Text className="text-xs text-theme-text-muted mb-1">Email</Text>
                <Text className="text-base text-theme-text-primary font-medium">
                  {profile.email}
                </Text>
              </View>
              <View className="px-4 py-4">
                <Text className="text-xs text-theme-text-muted mb-1">Wallet Address</Text>
                <Text className="text-base text-theme-text-primary font-mono">
                  {formatAddress(profile.walletAddress)}
                </Text>
              </View>
            </View>
          </View>

          {/* Security Section */}
          <View className="px-4 pb-6">
            <Text className="text-lg font-semibold text-theme-text-primary mb-4">Security</Text>
            <View className="bg-theme-surface rounded-xl border border-theme-border overflow-hidden">
              <View className="px-4 py-4 border-b border-theme-border flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base text-theme-text-primary font-medium mb-1">
                    Two-Factor Authentication
                  </Text>
                  <Text className="text-sm text-theme-text-secondary">
                    {security.twoFactorAuth ? "Enabled" : "Disabled"}
                  </Text>
                </View>
                <Switch
                  value={security.twoFactorAuth}
                  disabled
                  trackColor={{ false: "#e5e7eb", true: "#4169E1" }}
                  thumbColor={security.twoFactorAuth ? "#ffffff" : "#f4f3f4"}
                />
              </View>
              <View className="px-4 py-4 border-b border-theme-border flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base text-theme-text-primary font-medium mb-1">
                    Biometric Authentication
                  </Text>
                  <Text className="text-sm text-theme-text-secondary">
                    {security.biometricAuth ? "Enabled" : "Disabled"}
                  </Text>
                </View>
                <Switch
                  value={security.biometricAuth}
                  disabled
                  trackColor={{ false: "#e5e7eb", true: "#4169E1" }}
                  thumbColor={security.biometricAuth ? "#ffffff" : "#f4f3f4"}
                />
              </View>
              <View className="px-4 py-4 border-b border-theme-border flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base text-theme-text-primary font-medium mb-1">
                    Auto Lock
                  </Text>
                  <Text className="text-sm text-theme-text-secondary">
                    {security.autoLock
                      ? `Lock after ${security.autoLockTimeout} minutes`
                      : "Disabled"}
                  </Text>
                </View>
                <Switch
                  value={security.autoLock}
                  disabled
                  trackColor={{ false: "#e5e7eb", true: "#4169E1" }}
                  thumbColor={security.autoLock ? "#ffffff" : "#f4f3f4"}
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
                  value={notifications.transactionAlerts}
                  disabled
                  trackColor={{ false: "#e5e7eb", true: "#4169E1" }}
                  thumbColor={notifications.transactionAlerts ? "#ffffff" : "#f4f3f4"}
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
                  value={notifications.priceAlerts}
                  disabled
                  trackColor={{ false: "#e5e7eb", true: "#4169E1" }}
                  thumbColor={notifications.priceAlerts ? "#ffffff" : "#f4f3f4"}
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
                  value={notifications.securityAlerts}
                  disabled
                  trackColor={{ false: "#e5e7eb", true: "#4169E1" }}
                  thumbColor={notifications.securityAlerts ? "#ffffff" : "#f4f3f4"}
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
                  value={notifications.marketingEmails}
                  disabled
                  trackColor={{ false: "#e5e7eb", true: "#4169E1" }}
                  thumbColor={notifications.marketingEmails ? "#ffffff" : "#f4f3f4"}
                />
              </View>
            </View>
          </View>

          {/* Wallet Section */}
          <View className="px-4 pb-6">
            <Text className="text-lg font-semibold text-theme-text-primary mb-4">Wallet</Text>
            <View className="bg-theme-surface rounded-xl border border-theme-border overflow-hidden">
              {address && (
                <View className="px-4 py-4 border-b border-theme-border">
                  <Text className="text-xs text-theme-text-muted mb-1">Current Address</Text>
                  <Text className="text-sm text-theme-text-primary font-mono">
                    {formatAddress(address)}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                className="px-4 py-4"
                onPress={() => setShowImportModal(true)}
                activeOpacity={0.7}
              >
                <Text className="text-base text-theme-primary-light font-medium">
                  Import Seed Phrase
                </Text>
                <Text className="text-sm text-theme-text-secondary mt-1">
                  Replace current wallet with a new seed phrase
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* About Section */}
          <View className="px-4 pb-6">
            <Text className="text-lg font-semibold text-theme-text-primary mb-4">About</Text>
            <View className="bg-theme-surface rounded-xl border border-theme-border overflow-hidden">
              <View className="px-4 py-4 border-b border-theme-border">
                <Text className="text-xs text-theme-text-muted mb-1">Version</Text>
                <Text className="text-base text-theme-text-primary font-medium">
                  {appInfo.version} ({appInfo.buildNumber})
                </Text>
              </View>
              <View className="px-4 py-4">
                <Text className="text-xs text-theme-text-muted mb-1">Last Updated</Text>
                <Text className="text-base text-theme-text-primary font-medium">
                  {formatDate(appInfo.lastUpdated)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Import Seed Phrase Modal */}
      <Modal
        visible={showImportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeImportModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 justify-center px-4 bg-black/50">
            <View className="bg-theme-surface rounded-3xl border border-theme-border overflow-hidden">
              {/* Modal Header */}
              <View className="flex-row items-center justify-between px-6 py-4 border-b border-theme-border">
                <Text className="text-xl font-bold text-theme-text-primary">
                  Import Seed Phrase
                </Text>
                <TouchableOpacity
                  onPress={closeImportModal}
                  className="p-2"
                  activeOpacity={0.7}
                  disabled={isImporting}
                >
                  <Text className="text-2xl text-theme-text-primary">✕</Text>
                </TouchableOpacity>
              </View>

              {/* Modal Content */}
              <View className="px-6 py-6">
                {importSuccess ? (
                  <View className="items-center py-8">
                    <View className="w-16 h-16 rounded-full bg-green-500/20 items-center justify-center mb-4">
                      <Text className="text-4xl">✓</Text>
                    </View>
                    <Text className="text-theme-text-primary text-lg font-semibold">
                      Wallet Imported!
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text className="text-sm text-theme-text-muted mb-4">
                      Enter your 12 or 24 word seed phrase, separated by spaces. This will replace
                      your current wallet.
                    </Text>

                    <TextInput
                      className="bg-theme-background border border-theme-border rounded-xl px-4 py-4 text-theme-text-primary min-h-[120px]"
                      placeholder="word1 word2 word3 word4 ..."
                      placeholderTextColor="#9ca3af"
                      style={{ fontSize: 14, textAlignVertical: "top" }}
                      multiline
                      numberOfLines={4}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={seedPhraseInput}
                      onChangeText={setSeedPhraseInput}
                      editable={!isImporting}
                    />

                    {importError && (
                      <View className="mt-4 p-3 bg-red-500/10 rounded-xl">
                        <Text className="text-red-500 text-sm">{importError}</Text>
                      </View>
                    )}

                    <View className="mt-4 p-3 bg-yellow-500/10 rounded-xl">
                      <Text className="text-yellow-600 text-sm">
                        ⚠️ Warning: This will replace your current wallet. Make sure you have backed
                        up your current seed phrase if needed.
                      </Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleImportSeedPhrase}
                      disabled={isImporting || !seedPhraseInput.trim()}
                      className={`mt-6 rounded-xl py-4 items-center ${
                        isImporting || !seedPhraseInput.trim()
                          ? "bg-theme-primary-light/50"
                          : "bg-theme-primary-light"
                      }`}
                    >
                      {isImporting ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text className="text-white font-semibold text-base">Import Wallet</Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

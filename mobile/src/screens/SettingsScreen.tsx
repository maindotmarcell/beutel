import { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
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
import { getUserProfile, getAppInfo } from "@/services";
import { useNavigationStore } from "@/store/navigationStore";
import { useThemeStore } from "@/store/themeStore";
import { useWalletStore } from "@/store/walletStore";

export default function SettingsScreen() {
  const profile = getUserProfile();
  const appInfo = getAppInfo();
  const { theme } = useThemeStore();

  const { importWallet, address } = useWalletStore();

  const [showImportModal, setShowImportModal] = useState(false);
  const [seedPhraseInput, setSeedPhraseInput] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleImportSeedPhrase = async () => {
    setImportError(null);
    setImportSuccess(false);

    const cleanedPhrase = seedPhraseInput.trim().toLowerCase().replace(/\s+/g, " ");
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

  const formatAddress = (addr: string) => {
    if (addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const SectionCard = ({ children }: { children: React.ReactNode }) => (
    <View
      style={{
        backgroundColor: theme.background.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border.main,
        overflow: "hidden",
      }}
    >
      {children}
    </View>
  );

  const SettingRow = ({
    children,
    showBorder = true,
  }: {
    children: React.ReactNode;
    showBorder?: boolean;
  }) => (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: showBorder ? 1 : 0,
        borderBottomColor: theme.border.light,
      }}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background.main }} edges={[]}>
      <StatusBar style="light" />
      <View className="flex-1">
        <Navbar title="Settings" showCloseButton={true} />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Account Section */}
          <View className="px-5 py-6">
            <Text className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
              Account
            </Text>
            <SectionCard>
              <SettingRow>
                <Text className="text-xs mb-1" style={{ color: theme.text.muted }}>
                  Name
                </Text>
                <Text className="text-base font-medium" style={{ color: theme.text.primary }}>
                  {profile.name}
                </Text>
              </SettingRow>
              <SettingRow>
                <Text className="text-xs mb-1" style={{ color: theme.text.muted }}>
                  Email
                </Text>
                <Text className="text-base font-medium" style={{ color: theme.text.primary }}>
                  {profile.email}
                </Text>
              </SettingRow>
              <SettingRow showBorder={false}>
                <Text className="text-xs mb-1" style={{ color: theme.text.muted }}>
                  Wallet Address
                </Text>
                <Text className="text-base font-mono" style={{ color: theme.text.primary }}>
                  {formatAddress(profile.walletAddress)}
                </Text>
              </SettingRow>
            </SectionCard>
          </View>

          {/* Wallet Section */}
          <View className="px-5 pb-6">
            <Text className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
              Wallet
            </Text>
            <SectionCard>
              {address && (
                <SettingRow>
                  <Text className="text-xs mb-1" style={{ color: theme.text.muted }}>
                    Current Address
                  </Text>
                  <Text className="text-sm font-mono" style={{ color: theme.text.primary }}>
                    {formatAddress(address)}
                  </Text>
                </SettingRow>
              )}
              <TouchableOpacity
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                }}
                onPress={() => setShowImportModal(true)}
                activeOpacity={0.7}
              >
                <Text className="text-base font-medium" style={{ color: theme.primary.light }}>
                  Import Seed Phrase
                </Text>
                <Text className="text-sm mt-1" style={{ color: theme.text.secondary }}>
                  Replace current wallet with a new seed phrase
                </Text>
              </TouchableOpacity>
            </SectionCard>
          </View>

          {/* About Section */}
          <View className="px-5 pb-6">
            <Text className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
              About
            </Text>
            <SectionCard>
              <SettingRow>
                <Text className="text-xs mb-1" style={{ color: theme.text.muted }}>
                  Version
                </Text>
                <Text className="text-base font-medium" style={{ color: theme.text.primary }}>
                  {appInfo.version} ({appInfo.buildNumber})
                </Text>
              </SettingRow>
              <SettingRow showBorder={false}>
                <Text className="text-xs mb-1" style={{ color: theme.text.muted }}>
                  Last Updated
                </Text>
                <Text className="text-base font-medium" style={{ color: theme.text.primary }}>
                  {formatDate(appInfo.lastUpdated)}
                </Text>
              </SettingRow>
            </SectionCard>
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
          <View
            className="flex-1 justify-center px-5"
            style={{ backgroundColor: "rgba(7, 6, 14, 0.92)" }}
          >
            <View
              style={{
                backgroundColor: theme.background.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border.main,
                overflow: "hidden",
              }}
            >
              {/* Modal Header */}
              <View
                className="flex-row items-center justify-between px-6 py-4"
                style={{ borderBottomWidth: 1, borderBottomColor: theme.border.main }}
              >
                <Text className="text-xl font-bold" style={{ color: theme.text.primary }}>
                  Import Seed Phrase
                </Text>
                <TouchableOpacity
                  onPress={closeImportModal}
                  className="p-2"
                  activeOpacity={0.7}
                  disabled={isImporting}
                >
                  <Text className="text-lg font-light" style={{ color: theme.text.muted }}>
                    X
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Modal Content */}
              <View className="px-6 py-6">
                {importSuccess ? (
                  <View className="items-center py-8">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mb-4"
                      style={{ backgroundColor: theme.status.success.light }}
                    >
                      <Text
                        className="text-2xl font-bold"
                        style={{ color: theme.status.success.main }}
                      >
                        ✓
                      </Text>
                    </View>
                    <Text className="text-lg font-semibold" style={{ color: theme.text.primary }}>
                      Wallet Imported!
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text className="text-sm mb-4" style={{ color: theme.text.muted }}>
                      Enter your 12 or 24 word seed phrase, separated by spaces. This will replace
                      your current wallet.
                    </Text>

                    <TextInput
                      style={{
                        backgroundColor: theme.background.main,
                        borderWidth: 1,
                        borderColor: theme.border.main,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 16,
                        color: theme.text.primary,
                        fontSize: 14,
                        minHeight: 120,
                        textAlignVertical: "top",
                      }}
                      placeholder="word1 word2 word3 word4 ..."
                      placeholderTextColor={theme.text.muted}
                      multiline
                      numberOfLines={4}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={seedPhraseInput}
                      onChangeText={setSeedPhraseInput}
                      editable={!isImporting}
                    />

                    {importError && (
                      <View
                        className="mt-4 p-3 rounded-xl"
                        style={{ backgroundColor: theme.status.error.light }}
                      >
                        <Text className="text-sm" style={{ color: theme.status.error.main }}>
                          {importError}
                        </Text>
                      </View>
                    )}

                    <View
                      className="mt-4 p-3 rounded-xl"
                      style={{ backgroundColor: theme.status.warning.light }}
                    >
                      <Text
                        className="text-sm font-semibold mb-1"
                        style={{ color: theme.status.warning.main }}
                      >
                        Warning
                      </Text>
                      <Text className="text-sm" style={{ color: theme.status.warning.main }}>
                        This will replace your current wallet. Make sure you have backed up your
                        current seed phrase if needed.
                      </Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleImportSeedPhrase}
                      disabled={isImporting || !seedPhraseInput.trim()}
                      style={{
                        marginTop: 24,
                        borderRadius: 12,
                        paddingVertical: 16,
                        alignItems: "center",
                        backgroundColor:
                          isImporting || !seedPhraseInput.trim()
                            ? theme.background.elevated
                            : theme.primary.main,
                        elevation: isImporting || !seedPhraseInput.trim() ? 0 : 2,
                      }}
                    >
                      {isImporting ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text className="font-semibold text-base" style={{ color: "#ffffff" }}>
                          Import Wallet
                        </Text>
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

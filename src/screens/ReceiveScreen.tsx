import { View, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput } from "react-native";
import { useState } from "react";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import Text from "@/components/Text";
import GlassCard from "@/components/GlassCard";
import { useNavigationStore } from "@/store/navigationStore";
import { useThemeStore } from "@/store/themeStore";
import { useWalletStore } from "@/store/walletStore";

export default function ReceiveScreen() {
  const { closeReceive } = useNavigationStore();
  const { theme } = useThemeStore();
  const { address, network } = useWalletStore();
  const insets = useSafeAreaInsets();
  const [copied, setCopied] = useState(false);

  const receiveAddress = address ?? "No wallet created";

  const handleCopy = async () => {
    if (address) {
      await Clipboard.setStringAsync(address);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 justify-center px-4">
        <GlassCard
          borderRadius={24}
          intensity={50}
          style={{
            marginTop: insets.top + 20,
            marginBottom: insets.bottom + 20,
          }}
        >
          {/* Header */}
          <View
            className="flex-row items-center justify-between px-6 py-4"
            style={{ borderBottomWidth: 1, borderBottomColor: theme.border.main }}
          >
            <View>
              <Text className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                Receive Bitcoin
              </Text>
              <Text className="text-xs uppercase mt-1" style={{ color: theme.text.muted }}>
                {network !== "mainnet" ? "⚠️ Testnet" : "Mainnet"}
              </Text>
            </View>
            <TouchableOpacity onPress={closeReceive} className="p-2" activeOpacity={0.7}>
              <Text className="text-2xl" style={{ color: theme.text.muted }}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="px-6 py-6">
            {/* QR Code */}
            <View className="mb-6 items-center">
              <View
                className="w-64 h-64 rounded-xl items-center justify-center overflow-hidden"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderWidth: 2,
                  borderColor: theme.glass.border,
                  shadowColor: theme.primary.main,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.15,
                  shadowRadius: 20,
                  elevation: 8,
                }}
              >
                {address ? (
                  <QRCode
                    value={`bitcoin:${address}`}
                    size={240}
                    color="#000000"
                    backgroundColor="#FFFFFF"
                    quietZone={8}
                  />
                ) : (
                  <Text className="text-sm" style={{ color: theme.text.muted }}>
                    QR Code Placeholder
                  </Text>
                )}
              </View>
            </View>

            {/* Receive Address */}
            <View className="mb-6">
              <Text className="text-sm mb-2" style={{ color: theme.text.muted }}>
                Your Receive Address
              </Text>
              <View className="flex-row items-center gap-2">
                <TextInput
                  style={{
                    flex: 1,
                    backgroundColor: theme.background.main,
                    borderWidth: 1,
                    borderColor: theme.border.main,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    color: theme.text.primary,
                    fontFamily: "monospace",
                    fontSize: 14,
                  }}
                  value={receiveAddress}
                  editable={false}
                  selectTextOnFocus
                  multiline
                />
                <TouchableOpacity
                  onPress={handleCopy}
                  disabled={!address}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: theme.background.main,
                    borderWidth: 1,
                    borderColor: theme.border.main,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 60,
                  }}
                >
                  <Text className="text-lg" style={{ color: theme.text.primary }}>
                    {copied ? "✓" : "📋"}
                  </Text>
                </TouchableOpacity>
              </View>
              {copied && (
                <Text
                  className="text-sm mt-2 text-center"
                  style={{ color: theme.primary.light }}
                >
                  Copied!
                </Text>
              )}
            </View>
          </View>
        </GlassCard>
      </View>
    </KeyboardAvoidingView>
  );
}

import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { useState } from "react";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/Text";
import { useNavigationStore } from "@/store/navigationStore";
import { mockSettingsData } from "@/data/mockSettingsData";

export default function ReceiveScreen() {
  const { closeReceive } = useNavigationStore();
  const insets = useSafeAreaInsets();
  const receiveAddress = mockSettingsData.profile.walletAddress;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(receiveAddress);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 justify-center px-4">
        <View
          className="bg-theme-surface rounded-3xl border border-theme-border overflow-hidden"
          style={{
            marginTop: insets.top + 20,
            marginBottom: insets.bottom + 20,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-theme-border">
            <Text className="text-2xl font-bold text-theme-text-primary">
              Receive Bitcoin
            </Text>
            <TouchableOpacity
              onPress={closeReceive}
              className="p-2"
              activeOpacity={0.7}
            >
              <Text className="text-2xl text-theme-text-primary">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="px-6 py-6">
            {/* QR Code Placeholder */}
            <View className="mb-6 items-center">
              <View className="w-64 h-64 border-2 border-theme-border rounded-xl items-center justify-center bg-theme-background">
                <Text className="text-theme-text-muted text-sm">
                  QR Code Placeholder
                </Text>
              </View>
            </View>

            {/* Receive Address */}
            <View className="mb-6">
              <Text className="text-sm text-theme-text-muted mb-2">
                Your Receive Address
              </Text>
              <View className="flex-row items-center gap-2">
                <TextInput
                  className="flex-1 bg-theme-background border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary font-mono"
                  value={receiveAddress}
                  editable={false}
                  selectTextOnFocus
                  style={{ fontSize: 14 }}
                  multiline
                />
                <TouchableOpacity
                  onPress={handleCopy}
                  className="bg-theme-background border border-theme-border rounded-xl px-4 py-3 items-center justify-center min-w-[60px]"
                  activeOpacity={0.7}
                >
                  <Text className="text-theme-text-primary text-lg">
                    {copied ? "✓" : "📋"}
                  </Text>
                </TouchableOpacity>
              </View>
              {copied && (
                <Text className="text-sm text-theme-text-muted mt-2 text-center">
                  Copied!
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

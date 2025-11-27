import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "../components/Text";
import { useNavigationStore } from "../store/navigationStore";

export default function SendScreen() {
  const { closeSend } = useNavigationStore();
  const insets = useSafeAreaInsets();

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
              Send Bitcoin
            </Text>
            <TouchableOpacity
              onPress={closeSend}
              className="p-2"
              activeOpacity={0.7}
            >
              <Text className="text-2xl text-theme-text-primary">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="px-6 py-6">
            {/* Recipient Address Input */}
            <View className="mb-6">
              <Text className="text-sm text-theme-text-muted mb-2">
                Recipient Address
              </Text>
              <TextInput
                className="bg-theme-background border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary font-mono"
                placeholder="Enter Bitcoin address"
                placeholderTextColor="#9ca3af"
                style={{ fontSize: 16 }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Amount Input */}
            <View className="mb-6">
              <Text className="text-sm text-theme-text-muted mb-2">Amount</Text>
              <TextInput
                className="bg-theme-background border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary"
                placeholder="0.00000000"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
                style={{ fontSize: 16 }}
              />
            </View>

            {/* Send Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                // TODO: Implement send transaction logic
                console.log("Send transaction");
              }}
              className="bg-theme-secondary rounded-xl py-4 items-center"
            >
              <Text className="text-white font-semibold text-base">Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

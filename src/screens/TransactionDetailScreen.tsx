import { View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import Navbar from "@/components/Navbar";
import Text from "@/components/Text";
import { useNavigationStore } from "@/store/navigationStore";
import { useThemeStore } from "@/store/themeStore";

export default function TransactionDetailScreen() {
  const { selectedTransaction, closeTransactionDetail } = useNavigationStore();
  const { theme } = useThemeStore();

  if (!selectedTransaction) {
    return null;
  }

  const transaction = selectedTransaction;
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case "confirmed":
        return { text: theme.status.success.main, bg: theme.status.success.light };
      case "pending":
        return { text: theme.status.warning.main, bg: theme.status.warning.light };
      case "failed":
        return { text: theme.status.error.main, bg: theme.status.error.light };
      default:
        return { text: theme.text.secondary, bg: theme.border.light };
    }
  };

  const isSend = transaction.type === "send";
  const statusColors = getStatusColors(transaction.status);
  const amountColor = isSend ? theme.text.primary : statusColors.text;
  const amountPrefix = isSend ? "-" : "+";

  const iconBg =
    transaction.status === "failed"
      ? statusColors.bg
      : isSend
        ? theme.background.elevated
        : statusColors.bg;
  const iconTextColor =
    transaction.status === "failed"
      ? statusColors.text
      : isSend
        ? theme.text.primary
        : statusColors.text;

  const icon = transaction.status === "failed" ? "✕" : isSend ? "↑" : "↓";

  const handleCopyAddress = async () => {
    try {
      await Clipboard.setStringAsync(transaction.address);
      Alert.alert("Copied", "Address copied to clipboard");
    } catch {
      Alert.alert("Error", "Failed to copy address");
    }
  };

  const handleCopyId = async () => {
    try {
      await Clipboard.setStringAsync(transaction.id);
      Alert.alert("Copied", "Transaction ID copied to clipboard");
    } catch {
      Alert.alert("Error", "Failed to copy transaction ID");
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background.main }} edges={[]}>
      <StatusBar style="light" />
      <View className="flex-1">
        <Navbar title="Transaction" showCloseButton={true} />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Transaction Header */}
          <View className="px-4 py-6">
            <View className="items-center mb-6">
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: iconBg }}
              >
                <Text className="text-4xl font-bold" style={{ color: iconTextColor }}>
                  {icon}
                </Text>
              </View>
              <Text className="text-3xl font-bold mb-2" style={{ color: amountColor }}>
                {amountPrefix} {transaction.amount.toFixed(8)} BTC
              </Text>
              <View
                className="px-3 py-1.5 rounded-full"
                style={{ backgroundColor: statusColors.bg }}
              >
                <Text
                  className="text-sm font-medium capitalize"
                  style={{ color: statusColors.text }}
                >
                  {transaction.status}
                </Text>
              </View>
            </View>

            {/* Transaction Details Card */}
            <View
              style={{
                backgroundColor: theme.background.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border.main,
                overflow: "hidden",
              }}
            >
              <DetailRow label="Direction" showBorder>
                <Text className="text-base font-medium" style={{ color: theme.text.primary }}>
                  {transaction.type === "send" ? "Outgoing" : "Incoming"}
                </Text>
              </DetailRow>

              <DetailRow label="Transaction Type" showBorder>
                <Text className="text-base font-medium" style={{ color: theme.text.primary }}>
                  {transaction.transactionType === "on-chain" ? "On-chain" : "Lightning"}
                </Text>
              </DetailRow>

              <DetailRow label="Fee" showBorder>
                <Text className="text-base font-medium" style={{ color: theme.text.primary }}>
                  {transaction.fee.toFixed(8)} BTC
                </Text>
              </DetailRow>

              <DetailRow label="Date & Time" showBorder>
                <Text className="text-base font-medium" style={{ color: theme.text.primary }}>
                  {formatDate(transaction.timestamp)}
                </Text>
              </DetailRow>

              <DetailRow
                label="Address"
                showBorder
                actionLabel="Copy"
                onAction={handleCopyAddress}
              >
                <Text className="text-base font-mono" style={{ color: theme.text.primary }}>
                  {transaction.address}
                </Text>
              </DetailRow>

              <DetailRow
                label="Transaction ID"
                showBorder={false}
                actionLabel="Copy"
                onAction={handleCopyId}
              >
                <Text className="text-base font-mono" style={{ color: theme.text.primary }}>
                  {transaction.id}
                </Text>
              </DetailRow>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  children,
  showBorder = true,
  actionLabel,
  onAction,
}: {
  label: string;
  children: React.ReactNode;
  showBorder?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { theme } = useThemeStore();

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: showBorder ? 1 : 0,
        borderBottomColor: theme.border.light,
      }}
    >
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-xs" style={{ color: theme.text.muted }}>
          {label}
        </Text>
        {actionLabel && onAction && (
          <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
            <Text className="text-xs font-medium" style={{ color: theme.primary.light }}>
              {actionLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
}

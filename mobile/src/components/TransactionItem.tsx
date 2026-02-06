import { View, TouchableOpacity } from "react-native";
import { Transaction } from "@/types/wallet";
import Text from "@/components/Text";
import { useThemeStore } from "@/store/themeStore";

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export default function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const { theme } = useThemeStore();

  const formatAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes}m ago`;
      }
      return `${hours}h ago`;
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
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

  // Amount color: white for sends, status color for receives
  const amountColor = isSend ? theme.text.primary : statusColors.text;
  const amountPrefix = isSend ? "" : "+";

  // Icon styling
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

  return (
    <TouchableOpacity
      style={{
        backgroundColor: theme.background.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.border.light,
        paddingHorizontal: 16,
        paddingVertical: 16,
      }}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text
              className="text-base font-semibold mr-2"
              style={{ color: amountColor }}
            >
              {amountPrefix} {transaction.amount.toFixed(8)} BTC
            </Text>
            <View
              className="px-2 py-1 rounded-full"
              style={{ backgroundColor: statusColors.bg }}
            >
              <Text
                className="text-xs font-medium capitalize"
                style={{ color: statusColors.text }}
              >
                {transaction.status}
              </Text>
            </View>
          </View>
          <Text
            className="text-sm font-mono mb-1"
            style={{ color: theme.text.secondary }}
          >
            {formatAddress(transaction.address)}
          </Text>
          <Text className="text-xs" style={{ color: theme.text.muted }}>
            {formatDate(transaction.timestamp)}
          </Text>
        </View>
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Text className="text-xl font-bold" style={{ color: iconTextColor }}>
            {icon}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

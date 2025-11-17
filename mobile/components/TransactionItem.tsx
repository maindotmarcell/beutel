import { View, TouchableOpacity } from "react-native";
import { Transaction } from "../types/wallet";
import Text from "./Text";

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export default function TransactionItem({
  transaction,
  onPress,
}: TransactionItemProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-theme-status-success bg-theme-status-success-light";
      case "pending":
        return "text-theme-status-warning bg-theme-status-warning-light";
      case "failed":
        return "text-theme-status-error bg-theme-status-error-light";
      default:
        return "text-theme-text-secondary bg-theme-border-light";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-theme-status-success";
      case "pending":
        return "text-theme-status-warning";
      case "failed":
        return "text-theme-status-error";
      default:
        return "text-theme-text-primary";
    }
  };

  const getStatusIconBg = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-theme-status-success-light";
      case "pending":
        return "bg-theme-status-warning-light";
      case "failed":
        return "bg-theme-status-error-light";
      default:
        return "bg-theme-border-light";
    }
  };

  const isSend = transaction.type === "send";
  // For send transactions, use black. For receive, use status-based colors
  const amountColor = isSend
    ? "text-theme-text-primary"
    : getStatusTextColor(transaction.status);
  const amountPrefix = isSend ? "-" : "+";

  // Icon colors: for failed transactions, always use red. For send transactions, use black/neutral. For receive, use status-based colors
  const iconBg =
    transaction.status === "failed"
      ? getStatusIconBg(transaction.status)
      : isSend
      ? "bg-theme-border-light"
      : getStatusIconBg(transaction.status);
  const iconTextColor =
    transaction.status === "failed"
      ? getStatusTextColor(transaction.status)
      : isSend
      ? "text-theme-text-primary"
      : getStatusTextColor(transaction.status);

  // Icon: X for failed, arrow for others
  const icon = transaction.status === "failed" ? "✕" : isSend ? "↑" : "↓";

  return (
    <TouchableOpacity
      className="bg-theme-surface-soft border-b border-theme-border px-4 py-4"
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className={`text-base font-semibold ${amountColor} mr-2`}>
              {amountPrefix} {transaction.amount.toFixed(8)} BTC
            </Text>
            <View
              className={`px-2 py-1 rounded-full ${getStatusColor(
                transaction.status
              )}`}
            >
              <Text className="text-xs font-medium capitalize">
                {transaction.status}
              </Text>
            </View>
          </View>
          <Text className="text-theme-text-secondary text-sm font-mono mb-1">
            {formatAddress(transaction.address)}
          </Text>
          <Text className="text-theme-text-muted text-xs">
            {formatDate(transaction.timestamp)}
          </Text>
        </View>
        <View
          className={`w-12 h-12 rounded-full items-center justify-center ${iconBg}`}
        >
          <Text className={`text-xl font-bold ${iconTextColor}`}>{icon}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

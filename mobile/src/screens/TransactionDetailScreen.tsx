import { View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import Navbar from "@/components/Navbar";
import Text from "@/components/Text";
import { useNavigationStore } from "@/store/navigationStore";

export default function TransactionDetailScreen() {
  const { selectedTransaction, closeTransactionDetail } = useNavigationStore();

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
  const amountColor = isSend
    ? "text-theme-text-primary"
    : getStatusTextColor(transaction.status);
  const amountPrefix = isSend ? "-" : "+";

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

  const icon = transaction.status === "failed" ? "✕" : isSend ? "↑" : "↓";

  const handleCopyAddress = async () => {
    try {
      await Clipboard.setStringAsync(transaction.address);
      Alert.alert("Copied", "Address copied to clipboard");
    } catch (error) {
      Alert.alert("Error", "Failed to copy address");
    }
  };

  const handleCopyId = async () => {
    try {
      await Clipboard.setStringAsync(transaction.id);
      Alert.alert("Copied", "Transaction ID copied to clipboard");
    } catch (error) {
      Alert.alert("Error", "Failed to copy transaction ID");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-theme-background" edges={[]}>
      <StatusBar style="dark" />
      <View className="flex-1">
        {/* Navbar */}
        <Navbar title="Transaction" showCloseButton={true} />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Transaction Header */}
          <View className="px-4 py-6">
            <View className="items-center mb-6">
              <View
                className={`w-20 h-20 rounded-full items-center justify-center ${iconBg} mb-4`}
              >
                <Text className={`text-4xl font-bold ${iconTextColor}`}>
                  {icon}
                </Text>
              </View>
              <Text className={`text-3xl font-bold ${amountColor} mb-2`}>
                {amountPrefix} {transaction.amount.toFixed(8)} BTC
              </Text>
              <View
                className={`px-3 py-1.5 rounded-full ${getStatusColor(
                  transaction.status
                )}`}
              >
                <Text className="text-sm font-medium capitalize">
                  {transaction.status}
                </Text>
              </View>
            </View>

            {/* Transaction Details Card */}
            <View className="bg-theme-surface rounded-xl border border-theme-border overflow-hidden">
              <View className="px-4 py-4 border-b border-theme-border">
                <Text className="text-xs text-theme-text-muted mb-1">
                  Direction
                </Text>
                <Text className="text-base text-theme-text-primary font-medium">
                  {transaction.type === "send" ? "Outgoing" : "Incoming"}
                </Text>
              </View>

              <View className="px-4 py-4 border-b border-theme-border">
                <Text className="text-xs text-theme-text-muted mb-1">
                  Transaction Type
                </Text>
                <Text className="text-base text-theme-text-primary font-medium">
                  {transaction.transactionType === "on-chain"
                    ? "On-chain"
                    : "Lightning"}
                </Text>
              </View>

              <View className="px-4 py-4 border-b border-theme-border">
                <Text className="text-xs text-theme-text-muted mb-1">Fee</Text>
                <Text className="text-base text-theme-text-primary font-medium">
                  {transaction.fee.toFixed(8)} BTC
                </Text>
              </View>

              <View className="px-4 py-4 border-b border-theme-border">
                <Text className="text-xs text-theme-text-muted mb-1">
                  Date & Time
                </Text>
                <Text className="text-base text-theme-text-primary font-medium">
                  {formatDate(transaction.timestamp)}
                </Text>
              </View>

              <View className="px-4 py-4 border-b border-theme-border">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-xs text-theme-text-muted">Address</Text>
                  <TouchableOpacity
                    onPress={handleCopyAddress}
                    activeOpacity={0.7}
                  >
                    <Text className="text-xs text-theme-primary-main font-medium">
                      Copy
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-base text-theme-text-primary font-mono">
                  {transaction.address}
                </Text>
              </View>

              <View className="px-4 py-4">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-xs text-theme-text-muted">
                    Transaction ID
                  </Text>
                  <TouchableOpacity onPress={handleCopyId} activeOpacity={0.7}>
                    <Text className="text-xs text-theme-primary-main font-medium">
                      Copy
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-base text-theme-text-primary font-mono">
                  {transaction.id}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

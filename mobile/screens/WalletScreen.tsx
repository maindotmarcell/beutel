import { View, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Navbar from "../components/Navbar";
import BalanceCard from "../components/BalanceCard";
import TransactionList from "../components/TransactionList";
import ActionButton from "../components/ActionButton";
import Text from "../components/Text";
import { mockWalletData } from "../data/mockWalletData";
import { Transaction } from "../types/wallet";

interface WalletScreenProps {
  onSettingsPress?: () => void;
  onTransactionPress?: (transaction: Transaction) => void;
}

export default function WalletScreen({
  onSettingsPress,
  onTransactionPress,
}: WalletScreenProps) {
  const handleSend = () => {
    Alert.alert("Send Bitcoin", "Send functionality will be implemented here");
  };

  const handleReceive = () => {
    Alert.alert(
      "Receive Bitcoin",
      "Receive functionality will be implemented here"
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-theme-background" edges={[]}>
      <StatusBar style="dark" />
      <View className="flex-1">
        {/* Gradient Background Container */}
        <LinearGradient
          colors={['#1a0a2e', '#4c1d95', '#9333ea']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pb-6"
        >
          {/* Navbar */}
          <Navbar onSettingsPress={onSettingsPress} />

          {/* Balance Card */}
          <BalanceCard balance={mockWalletData.balance} />

          {/* Action Buttons */}
          <View className="flex-row px-4 mb-4">
            <ActionButton
              label="Send"
              icon="↑"
              onPress={handleSend}
              variant="primary"
            />
            <ActionButton
              label="Receive"
              icon="↓"
              onPress={handleReceive}
              variant="secondary"
            />
          </View>
        </LinearGradient>

        {/* Transaction List Header */}
        <View className="px-4 mb-2 mt-6">
          <Text className="text-lg font-semibold text-theme-text-primary">
            Recent Transactions
          </Text>
        </View>

        {/* Transaction List */}
        <TransactionList
          transactions={mockWalletData.transactions}
          onTransactionPress={onTransactionPress}
        />
      </View>
    </SafeAreaView>
  );
}

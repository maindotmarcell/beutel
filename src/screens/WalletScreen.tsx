import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Navbar from "@/components/Navbar";
import BalanceCard from "@/components/BalanceCard";
import TransactionList from "@/components/TransactionList";
import ActionButton from "@/components/ActionButton";
import Text from "@/components/Text";
import { mockWalletData } from "@/data/mockWalletData";
import { useNavigationStore } from "@/store/navigationStore";
import { useThemeStore } from "@/store/themeStore";

export default function WalletScreen() {
  const { navigateToSend, navigateToReceive, navigateToTransactionDetail } =
    useNavigationStore();
  const { theme } = useThemeStore();

  const handleSend = () => {
    navigateToSend();
  };

  const handleReceive = () => {
    navigateToReceive();
  };

  return (
    <SafeAreaView className="flex-1 bg-theme-background" edges={[]}>
      <StatusBar style="dark" />
      <View className="flex-1">
        <View style={{ backgroundColor: theme.primary.main }} className="pb-6">
          <Navbar />
          <BalanceCard balance={mockWalletData.balance} />
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
        </View>

        <TransactionListHeader />

        <TransactionList
          transactions={mockWalletData.transactions}
          onTransactionPress={navigateToTransactionDetail}
        />
      </View>
    </SafeAreaView>
  );
}

function TransactionListHeader() {
  return (
    <View className="px-4 mb-2 mt-6">
      <Text className="text-lg font-semibold text-theme-text-primary">
        Recent Transactions
      </Text>
    </View>
  );
}

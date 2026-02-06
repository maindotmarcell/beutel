import { View, RefreshControl, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import Navbar from "@/components/Navbar";
import BalanceCard from "@/components/BalanceCard";
import TransactionList from "@/components/TransactionList";
import ActionButton from "@/components/ActionButton";
import Text from "@/components/Text";
import { useNavigationStore } from "@/store/navigationStore";
import { useThemeStore } from "@/store/themeStore";
import { useWalletStore } from "@/store/walletStore";
import { satsToBtc } from "@/utils/bitcoinUtils";

export default function WalletScreen() {
  const { navigateToSend, navigateToReceive, navigateToTransactionDetail } = useNavigationStore();
  const { theme } = useThemeStore();
  const {
    balance,
    unconfirmedBalance,
    isBalanceLoading,
    fetchBalance,
    transactions,
    isTransactionsLoading,
    fetchTransactions,
  } = useWalletStore();
  const [refreshing, setRefreshing] = useState(false);

  const balanceInBtc = satsToBtc(balance);
  const unconfirmedInBtc = satsToBtc(unconfirmedBalance);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchBalance(), fetchTransactions()]);
    setRefreshing(false);
  }, [fetchBalance, fetchTransactions]);

  const handleSend = () => {
    navigateToSend();
  };

  const handleReceive = () => {
    navigateToReceive();
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background.main }}
      edges={[]}
    >
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary.light}
          />
        }
      >
        {/* Hero gradient — deep purple nebula fading into the void */}
        <LinearGradient
          colors={["#1A0938", "#110F1D", theme.background.main]}
          locations={[0, 0.55, 1]}
          className="pb-6"
        >
          <Navbar />
          <BalanceCard
            balance={balanceInBtc}
            unconfirmedBalance={unconfirmedInBtc}
            isLoading={isBalanceLoading}
          />
          <View className="flex-row px-4 mb-4">
            <ActionButton label="Send" icon="↑" onPress={handleSend} variant="primary" />
            <ActionButton label="Receive" icon="↓" onPress={handleReceive} variant="secondary" />
          </View>
        </LinearGradient>

        <TransactionListHeader />

        <TransactionList
          transactions={transactions}
          onTransactionPress={navigateToTransactionDetail}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function TransactionListHeader() {
  const { theme } = useThemeStore();

  return (
    <View className="px-4 mb-2 mt-6">
      <Text className="text-lg font-semibold" style={{ color: theme.text.primary }}>
        Recent Transactions
      </Text>
    </View>
  );
}

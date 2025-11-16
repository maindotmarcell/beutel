import { View, Text, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Navbar from '../components/Navbar';
import BalanceCard from '../components/BalanceCard';
import TransactionList from '../components/TransactionList';
import ActionButton from '../components/ActionButton';
import { mockWalletData } from '../data/mockWalletData';

export default function WalletScreen() {
  const handleSend = () => {
    Alert.alert('Send Bitcoin', 'Send functionality will be implemented here');
  };

  const handleReceive = () => {
    Alert.alert('Receive Bitcoin', 'Receive functionality will be implemented here');
  };

  return (
    <SafeAreaView className="flex-1 bg-theme-background" edges={[]}>
      <StatusBar style="dark" />
      <View className="flex-1">
        {/* Navbar */}
        <Navbar />

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

        {/* Transaction List Header */}
        <View className="px-4 mb-2">
          <Text className="text-lg font-semibold text-theme-text-primary">Recent Transactions</Text>
        </View>

        {/* Transaction List */}
        <TransactionList transactions={mockWalletData.transactions} />
      </View>
    </SafeAreaView>
  );
}


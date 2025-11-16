import { View } from 'react-native';
import Text from './Text';

interface BalanceCardProps {
  balance: number;
}

export default function BalanceCard({ balance }: BalanceCardProps) {
  // Assuming 1 BTC = $45,000 USD for dummy data
  const usdValue = balance * 45000;

  return (
    <View className="bg-theme-primary rounded-2xl p-6 mx-4 my-4 shadow-lg">
      <Text className="text-white opacity-80 text-sm font-medium mb-2">Total Balance</Text>
      <Text className="text-white text-4xl font-bold mb-1">
        {balance.toFixed(8)} BTC
      </Text>
      <Text className="text-white opacity-80 text-lg font-medium">
        ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Text>
    </View>
  );
}


import { View, ActivityIndicator } from "react-native";
import Text from "@/components/Text";

interface BalanceCardProps {
  balance: number;
  unconfirmedBalance?: number;
  isLoading?: boolean;
}

export default function BalanceCard({
  balance,
  unconfirmedBalance = 0,
  isLoading = false,
}: BalanceCardProps) {
  // Assuming 1 BTC = $100,000 USD for dummy data
  const usdValue = balance * 100000;

  return (
    <View
      className="mx-4 my-4 p-6 rounded-3xl"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
    >
      <View className="flex-row items-center mb-2">
        <Text className="text-white opacity-80 text-sm font-medium">
          Total Balance
        </Text>
        {isLoading && (
          <ActivityIndicator
            size="small"
            color="rgba(255, 255, 255, 0.8)"
            style={{ marginLeft: 8 }}
          />
        )}
      </View>
      <Text className="text-white text-4xl font-bold mb-1">
        {balance.toFixed(8)} BTC
      </Text>
      <Text className="text-white opacity-80 text-lg font-medium">
        $
        {usdValue.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>
      {unconfirmedBalance !== 0 && (
        <Text className="text-white opacity-60 text-sm font-medium mt-2">
          {unconfirmedBalance > 0 ? "+" : ""}
          {unconfirmedBalance.toFixed(8)} BTC unconfirmed
        </Text>
      )}
    </View>
  );
}

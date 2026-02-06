import { View, ActivityIndicator } from "react-native";
import Text from "@/components/Text";
import GlassCard from "@/components/GlassCard";
import { useThemeStore } from "@/store/themeStore";

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
  const { theme } = useThemeStore();
  const usdValue = balance * 100000;

  return (
    <GlassCard className="mx-4 my-4" highlight>
      <View className="p-6">
        <View className="flex-row items-center mb-2">
          <Text
            className="text-sm font-medium"
            style={{ color: theme.text.secondary }}
          >
            Total Balance
          </Text>
          {isLoading && (
            <ActivityIndicator
              size="small"
              color={theme.primary.light}
              style={{ marginLeft: 8 }}
            />
          )}
        </View>
        <Text
          className="text-4xl font-bold mb-1"
          style={{ color: theme.text.primary }}
        >
          {balance.toFixed(8)} BTC
        </Text>
        <Text
          className="text-lg font-medium"
          style={{ color: theme.text.secondary }}
        >
          $
          {usdValue.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        {unconfirmedBalance !== 0 && (
          <Text
            className="text-sm font-medium mt-2"
            style={{ color: theme.text.muted }}
          >
            {unconfirmedBalance > 0 ? "+" : ""}
            {unconfirmedBalance.toFixed(8)} BTC unconfirmed
          </Text>
        )}
      </View>
    </GlassCard>
  );
}

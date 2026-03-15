import { ScrollView, View } from "react-native";
import { Transaction } from "@/types/wallet";
import TransactionItem from "@/components/TransactionItem";
import Text from "@/components/Text";
import { useThemeStore } from "@/store/themeStore";

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionPress?: (transaction: Transaction) => void;
}

export default function TransactionList({
  transactions,
  onTransactionPress,
}: TransactionListProps) {
  const { theme } = useThemeStore();

  if (transactions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <Text className="text-lg mb-1" style={{ color: theme.text.secondary }}>
          No activity yet
        </Text>
        <Text className="text-sm" style={{ color: theme.text.muted }}>
          Your transactions will appear here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: theme.background.main }}>
      <View>
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onPress={onTransactionPress ? () => onTransactionPress(transaction) : undefined}
          />
        ))}
      </View>
    </ScrollView>
  );
}

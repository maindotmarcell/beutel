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
      <View className="flex-1 items-center justify-center py-12">
        <Text className="text-lg" style={{ color: theme.text.muted }}>
          No transactions yet
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: theme.background.main }}>
      <View
        style={{
          backgroundColor: theme.background.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          overflow: "hidden",
          borderWidth: 1,
          borderBottomWidth: 0,
          borderColor: theme.border.main,
        }}
      >
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

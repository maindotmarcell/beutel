import { ScrollView, View } from "react-native";
import { Transaction } from "@/types/wallet";
import TransactionItem from "@/components/TransactionItem";
import Text from "@/components/Text";

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionPress?: (transaction: Transaction) => void;
}

export default function TransactionList({
  transactions,
  onTransactionPress,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <Text className="text-theme-text-muted text-lg">No transactions yet</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-theme-background">
      <View className="bg-theme-surface rounded-t-3xl overflow-hidden">
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

import { View } from 'react-native';
import { Transaction } from '../types/wallet';
import Text from './Text';

interface TransactionItemProps {
  transaction: Transaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const formatAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes}m ago`;
      }
      return `${hours}h ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-theme-status-success bg-theme-status-success-light';
      case 'pending':
        return 'text-theme-status-warning bg-theme-status-warning-light';
      case 'failed':
        return 'text-theme-status-error bg-theme-status-error-light';
      default:
        return 'text-theme-text-secondary bg-theme-border-light';
    }
  };

  const isSend = transaction.type === 'send';
  const amountColor = isSend ? 'text-theme-status-error' : 'text-theme-status-success';
  const amountPrefix = isSend ? '-' : '+';

  return (
    <View className="bg-theme-surface-soft border-b border-theme-border px-4 py-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className={`text-base font-semibold ${amountColor} mr-2`}>
              {amountPrefix} {transaction.amount.toFixed(8)} BTC
            </Text>
            <View className={`px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
              <Text className="text-xs font-medium capitalize">
                {transaction.status}
              </Text>
            </View>
          </View>
          <Text className="text-theme-text-secondary text-sm font-mono mb-1">
            {formatAddress(transaction.address)}
          </Text>
          <Text className="text-theme-text-muted text-xs">
            {formatDate(transaction.timestamp)}
          </Text>
        </View>
        <View className={`w-12 h-12 rounded-full items-center justify-center ${
          isSend ? 'bg-theme-status-error-light' : 'bg-theme-status-success-light'
        }`}>
          <Text className={`text-xl font-bold ${isSend ? 'text-theme-status-error' : 'text-theme-status-success'}`}>
            {isSend ? '↓' : '↑'}
          </Text>
        </View>
      </View>
    </View>
  );
}


import { TouchableOpacity, View } from 'react-native';
import Text from './Text';

interface ActionButtonProps {
  label: string;
  icon: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export default function ActionButton({
  label,
  icon,
  onPress,
  variant = 'primary',
}: ActionButtonProps) {
  const isPrimary = variant === 'primary';
  const textColor = isPrimary ? 'text-white' : 'text-white';
  const iconBg = isPrimary ? 'bg-white opacity-20' : 'bg-white opacity-20';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 mx-2 rounded-3xl p-4 items-center justify-center"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      activeOpacity={0.8}
    >
      <View className={`w-12 h-12 rounded-full ${iconBg} items-center justify-center mb-2`}>
        <Text className="text-2xl">{icon}</Text>
      </View>
      <Text className={`${textColor} font-semibold text-base`}>{label}</Text>
    </TouchableOpacity>
  );
}


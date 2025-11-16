import { TouchableOpacity, Text, View } from 'react-native';

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
  const bgColor = isPrimary ? 'bg-theme-primary' : 'bg-theme-border-light';
  const textColor = isPrimary ? 'text-white' : 'text-theme-text-primary';
  const iconBg = isPrimary ? 'bg-white opacity-20' : 'bg-theme-border';

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 mx-2 ${bgColor} rounded-2xl p-4 items-center justify-center shadow-md`}
      activeOpacity={0.8}
    >
      <View className={`w-12 h-12 rounded-full ${iconBg} items-center justify-center mb-2`}>
        <Text className="text-2xl">{icon}</Text>
      </View>
      <Text className={`${textColor} font-semibold text-base`}>{label}</Text>
    </TouchableOpacity>
  );
}


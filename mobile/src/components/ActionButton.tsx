import { TouchableOpacity, View } from "react-native";
import Text from "@/components/Text";
import GlassCard from "@/components/GlassCard";
import { useThemeStore } from "@/store/themeStore";

interface ActionButtonProps {
  label: string;
  icon: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
}

export default function ActionButton({
  label,
  icon,
  onPress,
  variant = "primary",
}: ActionButtonProps) {
  const { theme } = useThemeStore();
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 mx-2"
      activeOpacity={0.8}
    >
      <GlassCard
        borderRadius={24}
        intensity={30}
        highlight
      >
        <View className="p-4 items-center justify-center">
          <View
            className="w-12 h-12 rounded-full items-center justify-center mb-2"
            style={{
              backgroundColor: theme.glass.highlight,
            }}
          >
            <Text className="text-2xl">{icon}</Text>
          </View>
          <Text
            className="font-semibold text-base"
            style={{ color: theme.text.primary }}
          >
            {label}
          </Text>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

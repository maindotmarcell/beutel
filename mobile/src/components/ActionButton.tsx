import { TouchableOpacity, View } from "react-native";
import Text from "@/components/Text";
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
    <TouchableOpacity onPress={onPress} className="flex-1 mx-2" activeOpacity={0.8}>
      <View
        className="p-4 flex-row items-center justify-center"
        style={{
          borderRadius: 12,
          backgroundColor: isPrimary ? theme.primary.main : theme.card.background,
          borderWidth: isPrimary ? 0 : 1,
          borderColor: isPrimary ? "transparent" : theme.card.border,
        }}
      >
        <Text
          className="text-lg mr-2"
          style={{ color: isPrimary ? "#FFFFFF" : theme.primary.light }}
        >
          {icon}
        </Text>
        <Text
          className="font-semibold text-base"
          style={{ color: isPrimary ? "#FFFFFF" : theme.primary.light }}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

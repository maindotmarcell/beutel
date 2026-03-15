import { View, ViewProps } from "react-native";
import { useThemeStore } from "@/store/themeStore";

interface CardProps extends ViewProps {
  /** Border radius. Default 16. */
  borderRadius?: number;
  /** Additional className for NativeWind. */
  className?: string;
}

export default function Card({
  borderRadius = 16,
  className = "",
  style,
  children,
  ...props
}: CardProps) {
  const { theme } = useThemeStore();

  return (
    <View
      className={className}
      style={[
        {
          borderRadius,
          borderWidth: 1,
          borderColor: theme.card.border,
          backgroundColor: theme.card.background,
          overflow: "hidden",
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

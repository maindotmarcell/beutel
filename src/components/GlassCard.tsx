import { View, ViewProps, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { useThemeStore } from "@/store/themeStore";

interface GlassCardProps extends ViewProps {
  /** Blur intensity (0-100). Default 40. */
  intensity?: number;
  /** Border radius. Default 24. */
  borderRadius?: number;
  /** Whether to show the purple highlight glow. Default false. */
  highlight?: boolean;
  /** Additional className for NativeWind. */
  className?: string;
}

export default function GlassCard({
  intensity = 40,
  borderRadius = 24,
  highlight = false,
  className = "",
  style,
  children,
  ...props
}: GlassCardProps) {
  const { theme } = useThemeStore();

  return (
    <View
      className={className}
      style={[
        {
          borderRadius,
          borderWidth: 1,
          borderColor: theme.glass.border,
          overflow: "hidden",
        },
        highlight && {
          shadowColor: theme.primary.main,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.2,
          shadowRadius: 20,
          elevation: 8,
        },
        style,
      ]}
      {...props}
    >
      <BlurView
        intensity={intensity}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      {/* Glass background layer */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: theme.glass.background },
        ]}
      />
      {/* Top shine highlight */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: highlight
              ? theme.glass.highlight
              : theme.glass.shine,
          },
        ]}
      />
      {/* Content */}
      {children}
    </View>
  );
}

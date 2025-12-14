import { Text as RNText, TextProps, StyleSheet } from "react-native";

interface CustomTextProps extends TextProps {
  className?: string;
}

export default function Text({ className = "", style, ...props }: CustomTextProps) {
  // Determine font family based on className
  let fontFamily = "Inter_400Regular"; // default

  // Check for font weight classes
  if (className.includes("font-mono")) {
    // Keep system monospace for wallet addresses
    fontFamily = "monospace";
  } else if (className.includes("font-bold")) {
    fontFamily = "Inter_700Bold";
  } else if (className.includes("font-semibold")) {
    fontFamily = "Inter_600SemiBold";
  } else if (className.includes("font-medium")) {
    fontFamily = "Inter_500Medium";
  }

  return (
    <RNText className={className} style={[{ fontFamily }, StyleSheet.flatten(style)]} {...props} />
  );
}

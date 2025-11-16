import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NavbarProps {
  onSettingsPress?: () => void;
  onBackPress?: () => void;
}

export default function Navbar({
  onSettingsPress,
  onBackPress,
}: NavbarProps) {
  const insets = useSafeAreaInsets();

  const handleSettings = () => {
    if (onSettingsPress) {
      onSettingsPress();
    } else {
      Alert.alert(
        "Settings",
        "Settings functionality will be implemented here"
      );
    }
  };

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    }
  };

  return (
    <View
      className="bg-theme-surface px-4 border-b border-theme-border"
      style={{ paddingTop: insets.top + 8, paddingBottom: 12 }}
    >
      <View className="flex-row items-center justify-between">
        {/* Back Button or App Name */}
        {onBackPress ? (
          <TouchableOpacity
            onPress={handleBack}
            className="flex-row items-center"
            activeOpacity={0.7}
          >
            <Text className="text-xl text-theme-text-primary mr-2">←</Text>
            <Text className="text-lg font-semibold text-theme-text-primary">
              Settings
            </Text>
          </TouchableOpacity>
        ) : (
          <Text className="text-2xl font-bold text-theme-text-primary">
            beutel
          </Text>
        )}

        {/* Action Buttons - Only show when not on settings screen */}
        {!onBackPress && (
          <TouchableOpacity
            onPress={handleSettings}
            className="p-2"
            activeOpacity={0.7}
          >
            <Text className="text-2xl text-theme-text-primary">☰</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

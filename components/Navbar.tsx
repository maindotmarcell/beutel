import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NavbarProps {
  onSettingsPress?: () => void;
  onProfilePress?: () => void;
}

export default function Navbar({
  onSettingsPress,
  onProfilePress,
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

  const handleProfile = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      Alert.alert("Profile", "Profile functionality will be implemented here");
    }
  };

  return (
    <View
      className="bg-theme-surface px-4 border-b border-theme-border"
      style={{ paddingTop: insets.top + 8, paddingBottom: 12 }}
    >
      <View className="flex-row items-center justify-between">
        {/* App Name */}
        <Text className="text-2xl font-bold text-theme-text-primary">
          beutel
        </Text>

        {/* Action Buttons */}
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleSettings}
            className="p-2 mr-2"
            activeOpacity={0.7}
          >
            <Text className="text-xl text-theme-text-primary">⚙️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleProfile}
            className="p-2"
            activeOpacity={0.7}
          >
            <Text className="text-xl text-theme-text-primary">👤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

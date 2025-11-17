import { View, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "./Text";

interface NavbarProps {
  onSettingsPress?: () => void;
  onBackPress?: () => void;
  title?: string;
  showCloseButton?: boolean;
}

export default function Navbar({
  onSettingsPress,
  onBackPress,
  title,
  showCloseButton = false,
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

  const isOnGradient = !onBackPress;
  const bgClass = isOnGradient ? '' : 'bg-theme-surface';
  const borderClass = isOnGradient ? '' : 'border-b border-theme-border';
  const textColor = isOnGradient ? 'text-white' : 'text-theme-text-primary';

  return (
    <View
      className={`${bgClass} px-4 ${borderClass}`}
      style={{ paddingTop: insets.top + 8, paddingBottom: 12 }}
    >
      <View className="flex-row items-center justify-between">
        {/* Back Button, Close Button, or App Name */}
        {onBackPress ? (
          showCloseButton ? (
            <>
              <Text className={`text-2xl font-bold ${textColor}`}>
                {title || "Transaction"}
              </Text>
              <TouchableOpacity
                onPress={handleBack}
                className="p-2"
                activeOpacity={0.7}
              >
                <Text className={`text-2xl ${textColor}`}>✕</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={handleBack}
              className="flex-row items-center"
              activeOpacity={0.7}
            >
              <Text className={`text-xl ${textColor} mr-2`}>←</Text>
              <Text className={`text-lg font-semibold ${textColor}`}>
                {title || "Back"}
              </Text>
            </TouchableOpacity>
          )
        ) : (
          <Text className={`text-2xl font-bold ${textColor}`}>
            beutel
          </Text>
        )}

        {/* Action Buttons - Only show when not on settings screen and not showing close button */}
        {!onBackPress && (
          <TouchableOpacity
            onPress={handleSettings}
            className="p-2"
            activeOpacity={0.7}
          >
            <Text className={`text-3xl ${textColor}`}>☰</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

import { View, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/Text";
import { useNavigationStore } from "@/store/navigationStore";

interface NavbarProps {
  title?: string;
  showCloseButton?: boolean;
}

export default function Navbar({
  title,
  showCloseButton = false,
}: NavbarProps) {
  const insets = useSafeAreaInsets();
  const { navigateToSettings, navigateToWallet, closeTransactionDetail, currentScreen } =
    useNavigationStore();

  const handleSettings = () => {
    navigateToSettings();
  };

  const handleBack = () => {
    if (showCloseButton) {
      // If on settings screen, navigate back to wallet; otherwise close transaction detail
      if (currentScreen === "settings") {
        navigateToWallet();
      } else {
        closeTransactionDetail();
      }
    } else {
      navigateToWallet();
    }
  };

  const hasBackAction = showCloseButton || title;

  const isOnGradient = !hasBackAction;
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
        {hasBackAction ? (
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
        {!hasBackAction && (
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

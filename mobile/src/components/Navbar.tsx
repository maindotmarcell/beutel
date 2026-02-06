import { View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/Text";
import { useNavigationStore } from "@/store/navigationStore";
import { useThemeStore } from "@/store/themeStore";

interface NavbarProps {
  title?: string;
  showCloseButton?: boolean;
}

export default function Navbar({ title, showCloseButton = false }: NavbarProps) {
  const insets = useSafeAreaInsets();
  const { navigateToSettings, navigateToWallet, closeTransactionDetail, currentScreen } =
    useNavigationStore();
  const { theme } = useThemeStore();

  const handleSettings = () => {
    navigateToSettings();
  };

  const handleBack = () => {
    if (showCloseButton) {
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

  // Always dark — transparent on wallet gradient, surface with bottom border elsewhere
  const isOnGradient = !hasBackAction;

  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingBottom: 12,
        paddingHorizontal: 16,
        backgroundColor: isOnGradient ? "transparent" : theme.background.surface,
        borderBottomWidth: isOnGradient ? 0 : 1,
        borderBottomColor: isOnGradient ? "transparent" : theme.border.main,
      }}
    >
      <View className="flex-row items-center justify-between">
        {hasBackAction ? (
          showCloseButton ? (
            <>
              <Text
                className="text-2xl font-bold"
                style={{ color: theme.text.primary }}
              >
                {title || "Transaction"}
              </Text>
              <TouchableOpacity onPress={handleBack} className="p-2" activeOpacity={0.7}>
                <Text className="text-2xl" style={{ color: theme.text.muted }}>
                  ✕
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={handleBack}
              className="flex-row items-center"
              activeOpacity={0.7}
            >
              <Text className="text-xl mr-2" style={{ color: theme.text.primary }}>
                ←
              </Text>
              <Text className="text-lg font-semibold" style={{ color: theme.text.primary }}>
                {title || "Back"}
              </Text>
            </TouchableOpacity>
          )
        ) : (
          <Text className="text-2xl font-bold" style={{ color: theme.text.primary }}>
            beutel
          </Text>
        )}

        {!hasBackAction && (
          <TouchableOpacity onPress={handleSettings} className="p-2" activeOpacity={0.7}>
            <Text className="text-3xl" style={{ color: theme.text.secondary }}>
              ☰
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

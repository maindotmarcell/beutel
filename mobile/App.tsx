import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Animated } from "react-native";
import { BlurView } from "expo-blur";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import "./global.css";
import WalletScreen from "./screens/WalletScreen";
import SettingsScreen from "./screens/SettingsScreen";
import TransactionDetailScreen from "./screens/TransactionDetailScreen";
import SendScreen from "./screens/SendScreen";
import { ThemeProvider } from "./theme/ThemeContext";
import { useNavigationStore } from "./store/navigationStore";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const {
    currentScreen,
    selectedTransaction,
    walletTranslateX,
    walletOpacity,
    settingsTranslateX,
    settingsOpacity,
    transactionDetailTranslateY,
    transactionDetailOpacity,
    sendTranslateY,
    sendOpacity,
    blurIntensity,
  } = useNavigationStore();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Animated.View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            opacity: walletOpacity,
            transform: [{ translateX: walletTranslateX }],
          }}
          pointerEvents={currentScreen === "wallet" ? "auto" : "none"}
        >
          <WalletScreen />
        </Animated.View>
        <AnimatedBlurView
          intensity={blurIntensity}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
          pointerEvents="none"
        />
        <Animated.View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            opacity: settingsOpacity,
            transform: [{ translateX: settingsTranslateX }],
          }}
          pointerEvents={currentScreen === "settings" ? "auto" : "none"}
        >
          <SettingsScreen />
        </Animated.View>
        {selectedTransaction && (
          <Animated.View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              opacity: transactionDetailOpacity,
              transform: [{ translateY: transactionDetailTranslateY }],
            }}
            pointerEvents={
              currentScreen === "transactionDetail" ? "auto" : "none"
            }
          >
            <TransactionDetailScreen />
          </Animated.View>
        )}
        <Animated.View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            opacity: sendOpacity,
            transform: [{ translateY: sendTranslateY }],
          }}
          pointerEvents={currentScreen === "send" ? "auto" : "none"}
        >
          <SendScreen />
        </Animated.View>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

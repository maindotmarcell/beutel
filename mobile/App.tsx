import { useState, useEffect, useRef } from "react";
import { Animated, Dimensions, Easing } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
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
import { ThemeProvider } from "./theme/ThemeContext";
import { Transaction } from "./types/wallet";

type Screen = "wallet" | "settings" | "transactionDetail";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const ANIMATION_DURATION = 300;

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [currentScreen, setCurrentScreen] = useState<Screen>("wallet");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Animation values for wallet screen
  const walletTranslateX = useRef(new Animated.Value(0)).current;
  const walletOpacity = useRef(new Animated.Value(1)).current;

  // Animation values for settings screen
  const settingsTranslateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const settingsOpacity = useRef(new Animated.Value(0)).current;

  // Animation values for transaction detail screen
  const transactionDetailTranslateY = useRef(
    new Animated.Value(SCREEN_HEIGHT)
  ).current;
  const transactionDetailOpacity = useRef(new Animated.Value(0)).current;

  const handleSettingsPress = () => {
    setCurrentScreen("settings");
  };

  const handleBackPress = () => {
    setCurrentScreen("wallet");
  };

  const handleTransactionPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setCurrentScreen("transactionDetail");
  };

  const handleTransactionDetailBackPress = () => {
    setCurrentScreen("wallet");
  };

  useEffect(() => {
    if (currentScreen === "settings") {
      // Animate settings screen sliding in from right
      Animated.parallel([
        Animated.timing(settingsTranslateX, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(settingsOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Fade out wallet screen
        Animated.timing(walletOpacity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Hide transaction detail screen
        Animated.timing(transactionDetailTranslateY, {
          toValue: SCREEN_HEIGHT,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(transactionDetailOpacity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (currentScreen === "transactionDetail") {
      // Animate transaction detail screen sliding in from bottom
      Animated.parallel([
        Animated.timing(transactionDetailTranslateY, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(transactionDetailOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Fade out wallet screen
        Animated.timing(walletOpacity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Hide settings screen
        Animated.timing(settingsTranslateX, {
          toValue: SCREEN_WIDTH,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(settingsOpacity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate back to wallet screen
      Animated.parallel([
        // Hide settings screen
        Animated.timing(settingsTranslateX, {
          toValue: SCREEN_WIDTH,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(settingsOpacity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Hide transaction detail screen
        Animated.timing(transactionDetailTranslateY, {
          toValue: SCREEN_HEIGHT,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(transactionDetailOpacity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Fade in wallet screen
        Animated.timing(walletOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentScreen]);

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
          <WalletScreen
            onSettingsPress={handleSettingsPress}
            onTransactionPress={handleTransactionPress}
          />
        </Animated.View>
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
          <SettingsScreen onBackPress={handleBackPress} />
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
            <TransactionDetailScreen
              transaction={selectedTransaction}
              onBackPress={handleTransactionDetailBackPress}
            />
          </Animated.View>
        )}
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

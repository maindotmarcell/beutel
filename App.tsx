import { useState } from "react";
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
import { ThemeProvider } from "./theme/ThemeContext";

type Screen = "wallet" | "settings";

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [currentScreen, setCurrentScreen] = useState<Screen>("wallet");

  const handleSettingsPress = () => {
    setCurrentScreen("settings");
  };

  const handleBackPress = () => {
    setCurrentScreen("wallet");
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        {currentScreen === "wallet" ? (
          <WalletScreen onSettingsPress={handleSettingsPress} />
        ) : (
          <SettingsScreen onBackPress={handleBackPress} />
        )}
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

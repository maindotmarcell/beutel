import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";
import WalletScreen from "./screens/WalletScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { ThemeProvider } from "./theme/ThemeContext";

type Screen = "wallet" | "settings";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("wallet");

  const handleSettingsPress = () => {
    setCurrentScreen("settings");
  };

  const handleBackPress = () => {
    setCurrentScreen("wallet");
  };

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

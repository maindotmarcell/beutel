import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import "../global.css";
import ViewWrapper from "@/components/ViewWrapper";
import SeedPhraseModal from "@/components/SeedPhraseModal";
import { useWalletInitialization } from "./hooks/useWalletInitialization";
import { defaultTheme } from "@/theme/colors";

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { isReady, seedPhraseToBackup, handleDismissSeedPhrase } = useWalletInitialization();

  // Show loading while fonts load or wallet initializes
  if (!fontsLoaded || !isReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: defaultTheme.background.main,
        }}
      >
        <ActivityIndicator size="large" color={defaultTheme.primary.light} />
      </View>
    );
  }

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: defaultTheme.background.main }}>
      <ViewWrapper />
      {seedPhraseToBackup && (
        <SeedPhraseModal seedPhrase={seedPhraseToBackup} onDismiss={handleDismissSeedPhrase} />
      )}
    </SafeAreaProvider>
  );
}

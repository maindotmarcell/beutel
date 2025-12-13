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
import { useWalletStore } from "@/store/walletStore";

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { initializeWallet, createWallet, isInitialized, isLoading } = useWalletStore();
  const [isReady, setIsReady] = useState(false);
  const [seedPhraseToBackup, setSeedPhraseToBackup] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Check if wallet exists
        await initializeWallet();
        
        // Get the current state after initialization
        const hasWallet = useWalletStore.getState().isInitialized;
        
        if (!hasWallet) {
          // No wallet exists, create one
          const mnemonic = await createWallet();
          setSeedPhraseToBackup(mnemonic);
        }
      } catch (error) {
        console.error("Failed to initialize wallet:", error);
      } finally {
        setIsReady(true);
      }
    };
    
    init();
  }, []);

  const handleDismissSeedPhrase = () => {
    setSeedPhraseToBackup(null);
  };

  // Show loading while fonts load or wallet initializes
  if (!fontsLoaded || !isReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F5F5F5" }}>
        <ActivityIndicator size="large" color="#4169E1" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ViewWrapper />
      {seedPhraseToBackup && (
        <SeedPhraseModal
          seedPhrase={seedPhraseToBackup}
          onDismiss={handleDismissSeedPhrase}
        />
      )}
    </SafeAreaProvider>
  );
}

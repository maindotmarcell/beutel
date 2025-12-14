import { useEffect, useState } from "react";
import { useWalletStore } from "@/store/walletStore";

export function useWalletInitialization() {
  const { initializeWallet, createWallet } = useWalletStore();
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

  return {
    isReady,
    seedPhraseToBackup,
    handleDismissSeedPhrase,
  };
}

import { create } from "zustand";
import { Animated, Dimensions, Easing } from "react-native";
import { Transaction } from "../types/wallet";

type Screen = "wallet" | "settings" | "transactionDetail" | "send";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const ANIMATION_DURATION = 300;

interface NavigationStore {
  // State
  currentScreen: Screen;
  selectedTransaction: Transaction | null;

  // Animation values
  walletTranslateX: Animated.Value;
  walletOpacity: Animated.Value;
  settingsTranslateX: Animated.Value;
  settingsOpacity: Animated.Value;
  transactionDetailTranslateY: Animated.Value;
  transactionDetailOpacity: Animated.Value;
  sendTranslateY: Animated.Value;
  sendOpacity: Animated.Value;
  blurIntensity: Animated.Value;

  // Actions
  navigateToSettings: () => void;
  navigateToWallet: () => void;
  navigateToTransactionDetail: (transaction: Transaction) => void;
  navigateToSend: () => void;
  navigateBack: () => void;
  closeTransactionDetail: () => void;
  closeSend: () => void;

  // Internal animation method
  animateScreenTransition: (screen: Screen) => void;
}

// Initialize animation values
const createAnimationValues = () => ({
  walletTranslateX: new Animated.Value(0),
  walletOpacity: new Animated.Value(1),
  settingsTranslateX: new Animated.Value(SCREEN_WIDTH),
  settingsOpacity: new Animated.Value(0),
  transactionDetailTranslateY: new Animated.Value(SCREEN_HEIGHT),
  transactionDetailOpacity: new Animated.Value(0),
  sendTranslateY: new Animated.Value(-SCREEN_HEIGHT),
  sendOpacity: new Animated.Value(0),
  blurIntensity: new Animated.Value(0),
});

export const useNavigationStore = create<NavigationStore>((set, get) => {
  const animationValues = createAnimationValues();

  const animateScreenTransition = (screen: Screen) => {
    const {
      walletOpacity,
      walletTranslateX,
      settingsTranslateX,
      settingsOpacity,
      transactionDetailTranslateY,
      transactionDetailOpacity,
      sendTranslateY,
      sendOpacity,
      blurIntensity,
    } = get();

    if (screen === "settings") {
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
    } else if (screen === "transactionDetail") {
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
    } else if (screen === "send") {
      // Animate send screen sliding in from bottom
      Animated.parallel([
        Animated.timing(sendTranslateY, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(sendOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Blur wallet screen background
        Animated.timing(blurIntensity, {
          toValue: 20,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
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
        // Hide send screen
        Animated.timing(sendTranslateY, {
          toValue: -SCREEN_HEIGHT,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(sendOpacity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Remove blur from wallet screen
        Animated.timing(blurIntensity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
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
  };

  return {
    // Initial state
    currentScreen: "wallet",
    selectedTransaction: null,

    // Animation values
    ...animationValues,

    // Navigation actions
    navigateToSettings: () => {
      set({ currentScreen: "settings" });
      get().animateScreenTransition("settings");
    },

    navigateToWallet: () => {
      set({ currentScreen: "wallet" });
      get().animateScreenTransition("wallet");
    },

    navigateToTransactionDetail: (transaction: Transaction) => {
      set({
        currentScreen: "transactionDetail",
        selectedTransaction: transaction,
      });
      get().animateScreenTransition("transactionDetail");
    },

    navigateToSend: () => {
      set({ currentScreen: "send" });
      get().animateScreenTransition("send");
    },

    navigateBack: () => {
      set({ currentScreen: "wallet" });
      get().animateScreenTransition("wallet");
    },

    closeTransactionDetail: () => {
      set({ currentScreen: "wallet", selectedTransaction: null });
      get().animateScreenTransition("wallet");
    },

    closeSend: () => {
      set({ currentScreen: "wallet" });
      get().animateScreenTransition("wallet");
    },

    // Internal method
    animateScreenTransition,
  };
});

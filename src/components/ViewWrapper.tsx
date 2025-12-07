import { StatusBar } from "expo-status-bar";
import { Animated } from "react-native";
import { BlurView } from "expo-blur";
import WalletScreen from "@/screens/WalletScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import TransactionDetailScreen from "@/screens/TransactionDetailScreen";
import SendScreen from "@/screens/SendScreen";
import ReceiveScreen from "@/screens/ReceiveScreen";
import { useNavigationStore } from "@/store/navigationStore";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function ViewWrapper() {
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
    receiveTranslateY,
    receiveOpacity,
    blurIntensity,
  } = useNavigationStore();

  return (
    <>
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
          opacity: sendOpacity,
          transform: [{ translateY: sendTranslateY }],
        }}
        pointerEvents={currentScreen === "send" ? "auto" : "none"}
      >
        <SendScreen />
      </Animated.View>

      <Animated.View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: receiveOpacity,
          transform: [{ translateY: receiveTranslateY }],
        }}
        pointerEvents={currentScreen === "receive" ? "auto" : "none"}
      >
        <ReceiveScreen />
      </Animated.View>

      <StatusBar style="auto" />
    </>
  );
}

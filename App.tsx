import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import "./global.css";

export default function App() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-lg">Welcome to Beutel!</Text>
      <Text className="text-md">A wallet that makes using Bitcoin easy...</Text>
      <StatusBar style="auto" />
    </View>
  );
}

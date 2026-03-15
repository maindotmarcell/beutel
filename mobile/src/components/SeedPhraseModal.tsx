import { View, TouchableOpacity, Modal, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/Text";
import { useThemeStore } from "@/store/themeStore";

interface SeedPhraseModalProps {
  seedPhrase: string;
  onDismiss: () => void;
}

export default function SeedPhraseModal({ seedPhrase, onDismiss }: SeedPhraseModalProps) {
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();
  const words = seedPhrase.split(" ");

  return (
    <Modal visible={true} animationType="fade" transparent={true} onRequestClose={onDismiss}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(7, 6, 14, 0.92)",
          justifyContent: "center",
          paddingHorizontal: 20,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <View
          style={{
            backgroundColor: theme.background.surface,
            borderRadius: 12,
            padding: 24,
            maxHeight: "90%",
            borderWidth: 1,
            borderColor: theme.border.main,
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: theme.text.primary,
                  marginBottom: 8,
                }}
              >
                Recovery Phrase
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.text.secondary,
                  textAlign: "center",
                }}
              >
                Write down these 12 words in order. This is the only way to recover your wallet.
              </Text>
            </View>

            {/* Warning */}
            <View
              style={{
                backgroundColor: theme.status.error.light,
                borderRadius: 12,
                padding: 12,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  color: theme.status.error.main,
                  fontWeight: "700",
                  marginBottom: 4,
                }}
              >
                Important
              </Text>
              <Text style={{ color: theme.status.error.main, fontSize: 13, opacity: 0.85 }}>
                Never share your recovery phrase. Anyone with these words can access your Bitcoin.
              </Text>
            </View>

            {/* Seed Phrase Grid */}
            <View
              style={{
                backgroundColor: theme.background.main,
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
              }}
            >
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {words.map((word, index) => (
                  <View
                    key={index}
                    style={{
                      width: "50%",
                      paddingVertical: 8,
                      paddingHorizontal: 4,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: theme.background.elevated,
                        borderRadius: 8,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: theme.text.muted,
                          fontSize: 12,
                          width: 24,
                        }}
                      >
                        {index + 1}.
                      </Text>
                      <Text
                        style={{
                          color: theme.text.primary,
                          fontWeight: "500",
                          fontSize: 14,
                        }}
                      >
                        {word}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Dismiss Button */}
            <TouchableOpacity
              onPress={onDismiss}
              style={{
                backgroundColor: theme.primary.main,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
                elevation: 2,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
                I've Saved My Recovery Phrase
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

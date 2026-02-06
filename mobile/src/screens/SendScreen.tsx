import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/Text";
import GlassCard from "@/components/GlassCard";
import { useNavigationStore } from "@/store/navigationStore";
import { useThemeStore } from "@/store/themeStore";
import { useWalletStore } from "@/store/walletStore";
import * as bitcoinService from "@/services/bitcoinService";
import { satsToBtc, btcToSats } from "@/utils/bitcoinUtils";

type SendStep = "input" | "preview" | "sending" | "success" | "error";

export default function SendScreen() {
  const { closeSend } = useNavigationStore();
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();

  const {
    network,
    balance,
    isSending,
    sendError,
    lastTxId,
    transactionPreview,
    prepareSendTransaction,
    confirmSendTransaction,
    clearSendState,
  } = useWalletStore();

  const [step, setStep] = useState<SendStep>("input");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amountBtc, setAmountBtc] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      clearSendState();
    };
  }, [clearSendState]);

  const validateInputs = (): boolean => {
    setValidationError(null);

    if (!recipientAddress.trim()) {
      setValidationError("Please enter a recipient address");
      return false;
    }

    if (!bitcoinService.isValidAddress(recipientAddress.trim(), network)) {
      setValidationError("Invalid Bitcoin address for this network");
      return false;
    }

    const amount = parseFloat(amountBtc);
    if (isNaN(amount) || amount <= 0) {
      setValidationError("Please enter a valid amount");
      return false;
    }

    const amountSats = btcToSats(amount);
    if (amountSats > balance) {
      setValidationError("Insufficient balance");
      return false;
    }

    if (amountSats < 546) {
      setValidationError("Amount too small (minimum 546 sats)");
      return false;
    }

    return true;
  };

  const handlePreview = async () => {
    if (!validateInputs()) return;

    setStep("preview");

    try {
      const amountSats = btcToSats(parseFloat(amountBtc));
      await prepareSendTransaction(recipientAddress.trim(), amountSats);
    } catch {
      setStep("error");
    }
  };

  const handleConfirmSend = async () => {
    setStep("sending");

    try {
      await confirmSendTransaction();
      setStep("success");
    } catch {
      setStep("error");
    }
  };

  const handleClose = () => {
    clearSendState();
    closeSend();
  };

  const handleBackToInput = () => {
    clearSendState();
    setStep("input");
  };

  const formatSats = (sats: number): string => {
    return sats.toLocaleString();
  };

  const renderInputStep = () => (
    <>
      {/* Recipient Address Input */}
      <View className="mb-6">
        <Text className="text-sm mb-2" style={{ color: theme.text.muted }}>
          Recipient Address
        </Text>
        <TextInput
          style={{
            backgroundColor: theme.background.main,
            borderWidth: 1,
            borderColor: theme.border.main,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            color: theme.text.primary,
            fontFamily: "monospace",
            fontSize: 14,
          }}
          placeholder="Enter Bitcoin address"
          placeholderTextColor={theme.text.muted}
          autoCapitalize="none"
          autoCorrect={false}
          value={recipientAddress}
          onChangeText={setRecipientAddress}
        />
      </View>

      {/* Amount Input */}
      <View className="mb-4">
        <Text className="text-sm mb-2" style={{ color: theme.text.muted }}>
          Amount (BTC)
        </Text>
        <TextInput
          style={{
            backgroundColor: theme.background.main,
            borderWidth: 1,
            borderColor: theme.border.main,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            color: theme.text.primary,
            fontSize: 16,
          }}
          placeholder="0.00000000"
          placeholderTextColor={theme.text.muted}
          keyboardType="decimal-pad"
          value={amountBtc}
          onChangeText={setAmountBtc}
        />
      </View>

      {/* Available Balance */}
      <View className="mb-6">
        <Text className="text-xs" style={{ color: theme.text.muted }}>
          Available: {satsToBtc(balance).toFixed(8)} BTC ({formatSats(balance)} sats)
        </Text>
      </View>

      {/* Validation Error */}
      {validationError && (
        <View
          className="mb-4 p-3 rounded-xl"
          style={{ backgroundColor: theme.status.error.light }}
        >
          <Text className="text-sm" style={{ color: theme.status.error.main }}>
            {validationError}
          </Text>
        </View>
      )}

      {/* Preview Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePreview}
        style={{
          backgroundColor: theme.primary.main,
          borderRadius: 12,
          paddingVertical: 16,
          alignItems: "center",
          shadowColor: theme.primary.main,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <Text className="font-semibold text-base" style={{ color: "#FFFFFF" }}>
          Review Transaction
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderPreviewStep = () => {
    if (isSending && !transactionPreview) {
      return (
        <View className="items-center py-8">
          <ActivityIndicator size="large" color={theme.primary.light} />
          <Text className="mt-4" style={{ color: theme.text.muted }}>
            Preparing transaction...
          </Text>
        </View>
      );
    }

    if (!transactionPreview) {
      return null;
    }

    return (
      <>
        <Text
          className="text-lg font-semibold mb-4"
          style={{ color: theme.text.primary }}
        >
          Confirm Transaction
        </Text>

        {/* Transaction Details */}
        <View
          className="rounded-xl p-4 mb-4"
          style={{
            backgroundColor: theme.background.main,
            borderWidth: 1,
            borderColor: theme.border.main,
          }}
        >
          <View className="flex-row justify-between mb-3">
            <Text style={{ color: theme.text.muted }}>To</Text>
            <Text
              className="font-mono text-xs flex-1 ml-4 text-right"
              numberOfLines={1}
              ellipsizeMode="middle"
              style={{ color: theme.text.primary }}
            >
              {transactionPreview.recipientAddress}
            </Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text style={{ color: theme.text.muted }}>Amount</Text>
            <Text style={{ color: theme.text.primary }}>
              {satsToBtc(transactionPreview.amountSats).toFixed(8)} BTC
            </Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text style={{ color: theme.text.muted }}>Network Fee</Text>
            <Text style={{ color: theme.text.primary }}>
              {formatSats(transactionPreview.feeSats)} sats
            </Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text style={{ color: theme.text.muted }}>Fee Rate</Text>
            <Text style={{ color: theme.text.primary }}>
              {transactionPreview.feeRate} sat/vB
            </Text>
          </View>

          <View style={{ borderTopWidth: 1, borderTopColor: theme.border.main, marginVertical: 8 }} />

          <View className="flex-row justify-between">
            <Text className="font-semibold" style={{ color: theme.text.primary }}>
              Total
            </Text>
            <Text className="font-semibold" style={{ color: theme.text.primary }}>
              {satsToBtc(transactionPreview.totalSats).toFixed(8)} BTC
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleBackToInput}
            className="flex-1 items-center"
            style={{
              backgroundColor: theme.background.main,
              borderWidth: 1,
              borderColor: theme.border.main,
              borderRadius: 12,
              paddingVertical: 16,
            }}
          >
            <Text className="font-semibold text-base" style={{ color: theme.text.primary }}>
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleConfirmSend}
            className="flex-1 items-center"
            style={{
              backgroundColor: theme.primary.main,
              borderRadius: 12,
              paddingVertical: 16,
              shadowColor: theme.primary.main,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Text className="font-semibold text-base" style={{ color: "#FFFFFF" }}>
              Confirm Send
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderSendingStep = () => (
    <View className="items-center py-8">
      <ActivityIndicator size="large" color={theme.primary.light} />
      <Text
        className="text-lg font-semibold mt-4"
        style={{ color: theme.text.primary }}
      >
        Sending Transaction...
      </Text>
      <Text className="mt-2 text-center" style={{ color: theme.text.muted }}>
        Please wait while your transaction is being broadcast to the network.
      </Text>
    </View>
  );

  const renderSuccessStep = () => (
    <View className="items-center py-6">
      <View
        className="w-16 h-16 rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: theme.status.success.light }}
      >
        <Text className="text-4xl" style={{ color: theme.status.success.main }}>
          ✓
        </Text>
      </View>
      <Text
        className="text-xl font-semibold mb-2"
        style={{ color: theme.text.primary }}
      >
        Transaction Sent!
      </Text>
      <Text className="text-center mb-4" style={{ color: theme.text.muted }}>
        Your transaction has been broadcast to the network.
      </Text>

      {lastTxId && (
        <View
          className="rounded-xl p-4 w-full mb-6"
          style={{
            backgroundColor: theme.background.main,
            borderWidth: 1,
            borderColor: theme.border.main,
          }}
        >
          <Text className="text-xs mb-1" style={{ color: theme.text.muted }}>
            Transaction ID
          </Text>
          <Text
            className="font-mono text-xs"
            numberOfLines={2}
            style={{ color: theme.text.primary }}
          >
            {lastTxId}
          </Text>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleClose}
        className="items-center w-full"
        style={{
          backgroundColor: theme.primary.main,
          borderRadius: 12,
          paddingVertical: 16,
          paddingHorizontal: 32,
          shadowColor: theme.primary.main,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <Text className="font-semibold text-base" style={{ color: "#FFFFFF" }}>
          Done
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorStep = () => (
    <View className="items-center py-6">
      <View
        className="w-16 h-16 rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: theme.status.error.light }}
      >
        <Text className="text-4xl" style={{ color: theme.status.error.main }}>
          ✕
        </Text>
      </View>
      <Text
        className="text-xl font-semibold mb-2"
        style={{ color: theme.text.primary }}
      >
        Transaction Failed
      </Text>
      <Text className="text-center mb-4" style={{ color: theme.text.muted }}>
        {sendError || "Something went wrong. Please try again."}
      </Text>

      <View className="flex-row gap-3 w-full">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleClose}
          className="flex-1 items-center"
          style={{
            backgroundColor: theme.background.main,
            borderWidth: 1,
            borderColor: theme.border.main,
            borderRadius: 12,
            paddingVertical: 16,
          }}
        >
          <Text className="font-semibold text-base" style={{ color: theme.text.primary }}>
            Close
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBackToInput}
          className="flex-1 items-center"
          style={{
            backgroundColor: theme.primary.main,
            borderRadius: 12,
            paddingVertical: 16,
            shadowColor: theme.primary.main,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Text className="font-semibold text-base" style={{ color: "#FFFFFF" }}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (step) {
      case "input":
        return renderInputStep();
      case "preview":
        return renderPreviewStep();
      case "sending":
        return renderSendingStep();
      case "success":
        return renderSuccessStep();
      case "error":
        return renderErrorStep();
    }
  };

  const getHeaderTitle = () => {
    switch (step) {
      case "input":
        return "Send Bitcoin";
      case "preview":
        return "Review";
      case "sending":
        return "Sending";
      case "success":
        return "Success";
      case "error":
        return "Error";
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-4">
          <GlassCard
            borderRadius={24}
            intensity={50}
            style={{
              marginTop: insets.top + 20,
              marginBottom: insets.bottom + 20,
            }}
          >
            {/* Header */}
            <View
              className="flex-row items-center justify-between px-6 py-4"
              style={{ borderBottomWidth: 1, borderBottomColor: theme.border.main }}
            >
              <Text className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                {getHeaderTitle()}
              </Text>
              {step !== "sending" && (
                <TouchableOpacity onPress={handleClose} className="p-2" activeOpacity={0.7}>
                  <Text className="text-2xl" style={{ color: theme.text.muted }}>
                    ✕
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Content */}
            <View className="px-6 py-6">{renderContent()}</View>
          </GlassCard>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

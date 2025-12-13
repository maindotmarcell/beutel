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
import { useNavigationStore } from "@/store/navigationStore";
import { useWalletStore } from "@/store/walletStore";
import * as bitcoinService from "@/services/bitcoinService";
import { satsToBtc, btcToSats } from "@/services/mempoolService";

type SendStep = "input" | "preview" | "sending" | "success" | "error";

export default function SendScreen() {
  const { closeSend } = useNavigationStore();
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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearSendState();
    };
  }, [clearSendState]);

  // Validate inputs
  const validateInputs = (): boolean => {
    setValidationError(null);

    // Validate address
    if (!recipientAddress.trim()) {
      setValidationError("Please enter a recipient address");
      return false;
    }

    if (!bitcoinService.isValidAddress(recipientAddress.trim(), network)) {
      setValidationError("Invalid Bitcoin address for this network");
      return false;
    }

    // Validate amount
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

    // Minimum amount check (dust threshold)
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
        <Text className="text-sm text-theme-text-muted mb-2">
          Recipient Address
        </Text>
        <TextInput
          className="bg-theme-background border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary font-mono"
          placeholder="Enter Bitcoin address"
          placeholderTextColor="#9ca3af"
          style={{ fontSize: 14 }}
          autoCapitalize="none"
          autoCorrect={false}
          value={recipientAddress}
          onChangeText={setRecipientAddress}
        />
      </View>

      {/* Amount Input */}
      <View className="mb-4">
        <Text className="text-sm text-theme-text-muted mb-2">Amount (BTC)</Text>
        <TextInput
          className="bg-theme-background border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary"
          placeholder="0.00000000"
          placeholderTextColor="#9ca3af"
          keyboardType="decimal-pad"
          style={{ fontSize: 16 }}
          value={amountBtc}
          onChangeText={setAmountBtc}
        />
      </View>

      {/* Available Balance */}
      <View className="mb-6">
        <Text className="text-xs text-theme-text-muted">
          Available: {satsToBtc(balance).toFixed(8)} BTC ({formatSats(balance)}{" "}
          sats)
        </Text>
      </View>

      {/* Validation Error */}
      {validationError && (
        <View className="mb-4 p-3 bg-red-500/10 rounded-xl">
          <Text className="text-red-500 text-sm">{validationError}</Text>
        </View>
      )}

      {/* Preview Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePreview}
        className="bg-theme-primary-light rounded-xl py-4 items-center"
      >
        <Text className="text-white font-semibold text-base">
          Review Transaction
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderPreviewStep = () => {
    if (isSending && !transactionPreview) {
      return (
        <View className="items-center py-8">
          <ActivityIndicator size="large" color="#f7931a" />
          <Text className="text-theme-text-muted mt-4">
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
        <Text className="text-lg font-semibold text-theme-text-primary mb-4">
          Confirm Transaction
        </Text>

        {/* Transaction Details */}
        <View className="bg-theme-background rounded-xl p-4 mb-4">
          <View className="flex-row justify-between mb-3">
            <Text className="text-theme-text-muted">To</Text>
            <Text
              className="text-theme-text-primary font-mono text-xs flex-1 ml-4 text-right"
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {transactionPreview.recipientAddress}
            </Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-theme-text-muted">Amount</Text>
            <Text className="text-theme-text-primary">
              {satsToBtc(transactionPreview.amountSats).toFixed(8)} BTC
            </Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-theme-text-muted">Network Fee</Text>
            <Text className="text-theme-text-primary">
              {formatSats(transactionPreview.feeSats)} sats
            </Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-theme-text-muted">Fee Rate</Text>
            <Text className="text-theme-text-primary">
              {transactionPreview.feeRate} sat/vB
            </Text>
          </View>

          <View className="border-t border-theme-border my-2" />

          <View className="flex-row justify-between">
            <Text className="text-theme-text-primary font-semibold">Total</Text>
            <Text className="text-theme-text-primary font-semibold">
              {satsToBtc(transactionPreview.totalSats).toFixed(8)} BTC
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleBackToInput}
            className="flex-1 bg-theme-background border border-theme-border rounded-xl py-4 items-center"
          >
            <Text className="text-theme-text-primary font-semibold text-base">
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleConfirmSend}
            className="flex-1 bg-theme-primary-light rounded-xl py-4 items-center"
          >
            <Text className="text-white font-semibold text-base">
              Confirm Send
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderSendingStep = () => (
    <View className="items-center py-8">
      <ActivityIndicator size="large" color="#f7931a" />
      <Text className="text-theme-text-primary text-lg font-semibold mt-4">
        Sending Transaction...
      </Text>
      <Text className="text-theme-text-muted mt-2 text-center">
        Please wait while your transaction is being broadcast to the network.
      </Text>
    </View>
  );

  const renderSuccessStep = () => (
    <View className="items-center py-6">
      <View className="w-16 h-16 rounded-full bg-green-500/20 items-center justify-center mb-4">
        <Text className="text-4xl">✓</Text>
      </View>
      <Text className="text-theme-text-primary text-xl font-semibold mb-2">
        Transaction Sent!
      </Text>
      <Text className="text-theme-text-muted text-center mb-4">
        Your transaction has been broadcast to the network.
      </Text>

      {lastTxId && (
        <View className="bg-theme-background rounded-xl p-4 w-full mb-6">
          <Text className="text-theme-text-muted text-xs mb-1">
            Transaction ID
          </Text>
          <Text
            className="text-theme-text-primary font-mono text-xs"
            numberOfLines={2}
          >
            {lastTxId}
          </Text>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleClose}
        className="bg-theme-primary-light rounded-xl py-4 px-8 items-center w-full"
      >
        <Text className="text-white font-semibold text-base">Done</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorStep = () => (
    <View className="items-center py-6">
      <View className="w-16 h-16 rounded-full bg-red-500/20 items-center justify-center mb-4">
        <Text className="text-4xl">✕</Text>
      </View>
      <Text className="text-theme-text-primary text-xl font-semibold mb-2">
        Transaction Failed
      </Text>
      <Text className="text-theme-text-muted text-center mb-4">
        {sendError || "Something went wrong. Please try again."}
      </Text>

      <View className="flex-row gap-3 w-full">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleClose}
          className="flex-1 bg-theme-background border border-theme-border rounded-xl py-4 items-center"
        >
          <Text className="text-theme-text-primary font-semibold text-base">
            Close
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBackToInput}
          className="flex-1 bg-theme-primary-light rounded-xl py-4 items-center"
        >
          <Text className="text-white font-semibold text-base">Try Again</Text>
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
          <View
            className="bg-theme-surface rounded-3xl border border-theme-border overflow-hidden"
            style={{
              marginTop: insets.top + 20,
              marginBottom: insets.bottom + 20,
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-theme-border">
              <Text className="text-2xl font-bold text-theme-text-primary">
                {getHeaderTitle()}
              </Text>
              {step !== "sending" && (
                <TouchableOpacity
                  onPress={handleClose}
                  className="p-2"
                  activeOpacity={0.7}
                >
                  <Text className="text-2xl text-theme-text-primary">✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Content */}
            <View className="px-6 py-6">{renderContent()}</View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { COLORS } from "@/constants/theme";

const PIN_KEY = "vault_pin_hash";

async function hashPin(pin) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

export default function VaultLockScreen({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [mode, setMode] = useState(null); // "set" | "confirm" | "enter"
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const existing = await SecureStore.getItemAsync(PIN_KEY);
      setMode(existing ? "enter" : "set");
    })();
  }, []);

  const handleSetPin = () => {
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }
    setError("");
    setMode("confirm");
  };

  const handleConfirmPin = async () => {
    if (confirmPin !== pin) {
      setError("PINs don't match");
      setConfirmPin("");
      return;
    }
    await SecureStore.setItemAsync(PIN_KEY, await hashPin(pin));
    onUnlock();
  };

  const handleEnterPin = async () => {
    const stored = await SecureStore.getItemAsync(PIN_KEY);
    const entered = await hashPin(pin);
    if (entered === stored) {
      onUnlock();
    } else {
      setError("Incorrect PIN");
      setPin("");
    }
  };

  const handleSubmit = () => {
    if (mode === "set") handleSetPin();
    else if (mode === "confirm") handleConfirmPin();
    else handleEnterPin();
  };

  if (!mode) return null;

  const titleMap = {
    set: "Set a Vault PIN",
    confirm: "Confirm your PIN",
    enter: "Enter Vault PIN",
  };

  const value = mode === "confirm" ? confirmPin : pin;
  const setValue = mode === "confirm" ? setConfirmPin : setPin;

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔒</Text>
      <Text style={styles.title}>{titleMap[mode]}</Text>
      <Text style={styles.subtitle}>
        {mode === "enter"
          ? "Your evidence stays private"
          : "You'll need this every time you open the vault"}
      </Text>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(t) => {
          setValue(t);
          setError("");
        }}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        autoFocus
        onSubmitEditing={handleSubmit}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>
          {mode === "set" ? "Continue" : mode === "confirm" ? "Set PIN" : "Unlock"}
        </Text>
      </TouchableOpacity>

      {mode === "confirm" && (
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => {
            setMode("set");
            setPin("");
            setConfirmPin("");
            setError("");
          }}
        >
          <Text style={styles.backLinkText}>Start over</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  icon: { fontSize: 32, marginBottom: 12 },
  title: { color: "#F0F0F0", fontSize: 18, fontWeight: "700", marginBottom: 6 },
  subtitle: { color: "#666", fontSize: 13, marginBottom: 24, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 10,
    color: "#F0F0F0",
    fontSize: 24,
    letterSpacing: 8,
    textAlign: "center",
    width: 180,
    paddingVertical: 12,
    backgroundColor: "#161616",
  },
  error: { color: "#E5484D", marginTop: 12, fontSize: 13 },
  button: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: { color: "#0A0A0A", fontWeight: "700", fontSize: 15 },
  backLink: { marginTop: 16, padding: 8 },
  backLinkText: { color: "#666", fontSize: 13, textDecorationLine: "underline" },
});

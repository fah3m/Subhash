import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { useTimer } from "@/hooks/useTimer";
import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

const DURATIONS = [
  { label: "30 sec", seconds: 5 },
  { label: "15 min", seconds: 900 },
  { label: "30 min", seconds: 1800 },
  { label: "1 hour", seconds: 3600 },
  { label: "2 hours", seconds: 7200 },
];

export default function CheckInScreen() {
  const { sessionToken } = useAuth();
  const [label, setLabel] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(1800);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const latestCheckIn = useQuery(
    api.checkIns.getLatest,
    sessionToken ? { sessionToken } : "skip"
  );

  const startCheckIn = useMutation(api.checkIns.startCheckIn);
  const cancelCheckIn = useMutation(api.checkIns.cancelCheckIn);

  const { display } = useTimer(
    latestCheckIn?.status === "active" ? latestCheckIn.expiresAt : undefined
  );

  const handleStart = async () => {
    setDismissed(false);
    if (!label.trim()) {
      Alert.alert("Add a label", "Where are you going?");
      return;
    }
    setLoading(true);
    try {
      await startCheckIn({
        sessionToken: sessionToken!,
        label: label.trim(),
        durationSeconds: selectedDuration,
      });
      setLabel("");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!latestCheckIn) return;
    setLoading(true);
    try {
      await cancelCheckIn({
        sessionToken: sessionToken!,
        checkInId: latestCheckIn._id,
      });
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading
  if (latestCheckIn === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  // Expired screen — status comes directly from Convex, no guessing
  if (latestCheckIn?.status === "expired" && !dismissed) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Check-in Expired</Text>
        </View>
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>{latestCheckIn.label}</Text>
          <View style={styles.expiredBox}>
            <Ionicons name="warning" size={40} color={COLORS.sos} />
            <Text style={styles.expiredText}>Timer expired</Text>
            <Text style={styles.expiredSub}>SOS has been triggered</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.safeButton, { backgroundColor: COLORS.sos }]}
          onPress={() => setDismissed(true)}
        >
          <Text style={styles.safeButtonText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Active timer
  if (latestCheckIn?.status === "active") {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Check-in Active</Text>
        </View>
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>{latestCheckIn.label}</Text>
          <Text style={styles.timerDisplay}>{display}</Text>
          <Text style={styles.timerSub}>remaining</Text>
          <View style={styles.warningBox}>
            <Ionicons name="alert-circle" size={16} color="#F59E0B" />
            <Text style={styles.warningText}>
              SOS will fire if you don't check in
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.safeButton, loading && { opacity: 0.6 }]}
          onPress={handleCancel}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0A0A0A" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#0A0A0A" />
              <Text style={styles.safeButtonText}>I'm Safe</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // Start form (no check-in, cancelled, or dismissed)
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Check-in Timer</Text>
        <Text style={styles.subtitle}>
          If you don't cancel before time runs out, SOS fires automatically.
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Where are you going?</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Walking home, Meeting someone..."
        placeholderTextColor="#555"
        value={label}
        onChangeText={setLabel}
        maxLength={60}
      />

      <Text style={styles.sectionLabel}>How long?</Text>
      <View style={styles.durationGrid}>
        {DURATIONS.map((d) => (
          <TouchableOpacity
            key={d.seconds}
            style={[
              styles.durationChip,
              selectedDuration === d.seconds && styles.durationChipActive,
            ]}
            onPress={() => setSelectedDuration(d.seconds)}
          >
            <Text
              style={[
                styles.durationChipText,
                selectedDuration === d.seconds && styles.durationChipTextActive,
              ]}
            >
              {d.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.startButton, loading && { opacity: 0.6 }]}
        onPress={handleStart}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            <Ionicons name="timer" size={20} color={COLORS.white} />
            <Text style={styles.startButtonText}>Start Timer</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={16} color="#666" />
        <Text style={styles.infoText}>
          Only you can cancel the timer. If you don't, your trusted contacts are alerted.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  content: { padding: 24, paddingTop: 60 },
  center: { flex: 1, backgroundColor: "#0A0A0A", justifyContent: "center", alignItems: "center" },
  header: { marginBottom: 32, paddingTop: 60, paddingHorizontal: 24 },
  title: { fontSize: 28, fontWeight: "800", color: "#F0F0F0", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#666", lineHeight: 20 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#F0F0F0",
    fontSize: 15,
    marginBottom: 28,
  },
  durationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 32,
  },
  durationChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    backgroundColor: "#161616",
  },
  durationChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  durationChipText: { color: "#888", fontWeight: "600", fontSize: 14 },
  durationChipTextActive: { color: "#0A0A0A" },
  startButton: {
    backgroundColor: "#1A3A1A",
    borderWidth: 1,
    borderColor: "#2D5A2D",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  startButtonText: { color: "#4ADE80", fontWeight: "700", fontSize: 16 },
  infoBox: {
    flexDirection: "row",
    gap: 8,
    padding: 14,
    backgroundColor: "#161616",
    borderRadius: 8,
    alignItems: "flex-start",
  },
  infoText: { color: "#555", fontSize: 13, flex: 1, lineHeight: 18 },
  timerCard: {
    margin: 24,
    padding: 32,
    backgroundColor: "#161616",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    alignItems: "center",
  },
  timerLabel: { color: "#888", fontSize: 15, marginBottom: 20, textAlign: "center" },
  timerDisplay: { fontSize: 72, fontWeight: "800", color: "#F0F0F0", letterSpacing: 2 },
  timerSub: { color: "#555", fontSize: 14, marginTop: 4, marginBottom: 24 },
  warningBox: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: "#2A1F00",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  warningText: { color: "#F59E0B", fontSize: 13 },
  expiredBox: { alignItems: "center", gap: 8, paddingVertical: 16 },
  expiredText: { color: COLORS.sos, fontSize: 24, fontWeight: "800" },
  expiredSub: { color: "#888", fontSize: 14 },
  safeButton: {
    marginHorizontal: 24,
    backgroundColor: "#4ADE80",
    borderRadius: 12,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  safeButtonText: { color: "#0A0A0A", fontWeight: "800", fontSize: 18 },
});
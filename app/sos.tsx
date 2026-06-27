import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Vibration,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS } from "@/constants/theme";

export default function SOSScreen() {
  const [triggered, setTriggered] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const handleSOS = () => {
    Vibration.vibrate([0, 300, 150, 300, 150, 600]);
    setTriggered(true);
    // TODO: call api.sos.manualSOS with location + battery
  };

  return (
    <View style={styles.screen}>
      {/* Dismiss */}
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => router.back()}
        accessibilityLabel="Close SOS screen"
      >
        <Ionicons name="close" size={22} color={COLORS.muted} />
      </TouchableOpacity>

      {triggered ? (
        // ── Confirmed state ────────────────────────────────────────────────
        <View style={styles.confirmedContainer}>
          <Text style={styles.confirmedEmoji}>🚨</Text>
          <Text style={styles.confirmedTitle}>Alert sent</Text>
          <Text style={styles.confirmedSub}>
            Your trusted circle has been notified with your location.
          </Text>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // ── Ready state ────────────────────────────────────────────────────
        <View style={styles.centreContent}>
          <Text style={styles.label}>Hold to send emergency alert</Text>

          {/* Outer pulse ring */}
          <Animated.View
            style={[styles.ring, { transform: [{ scale: pulseAnim }] }]}
            pointerEvents="none"
          />

          {/* SOS button */}
          <TouchableOpacity
            style={styles.sosButton}
            onPress={handleSOS}
            activeOpacity={0.88}
            accessibilityLabel="Trigger SOS"
            accessibilityRole="button"
          >
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>

          <Text style={styles.hint}>
            Sends your live location, battery level, and a message to all trusted contacts.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 56,
    right: SPACING.lg,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Ready state
  centreContent: {
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  label: {
    color: COLORS.muted,
    fontSize: 14,
    letterSpacing: 0.3,
    marginBottom: SPACING.xl,
    textAlign: "center",
  },
  ring: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: COLORS.sos,
    opacity: 0.3,
  },
  sosButton: {
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: COLORS.sos,
    alignItems: "center",
    justifyContent: "center",
  },
  sosText: {
    color: COLORS.white,
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: 4,
  },
  hint: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: SPACING.xl,
    maxWidth: 280,
  },

  // ── Confirmed state
  confirmedContainer: {
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  confirmedEmoji: {
    fontSize: 52,
    marginBottom: SPACING.lg,
  },
  confirmedTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: SPACING.sm,
  },
  confirmedSub: {
    color: COLORS.muted,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.xl,
    maxWidth: 280,
  },
  doneBtn: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  doneBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "500",
  },
});
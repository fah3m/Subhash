import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, FONT } from "@/constants/theme";

function timeAgo(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function HomeScreen() {
  const { user, sessionToken } = useAuth();

  const activeCheckIn = useQuery(
    api.checkIns.getActive,
    sessionToken ? { sessionToken } : "skip"
  );

  const incomingAlerts = useQuery(
    api.sos.listIncoming,
    sessionToken ? { sessionToken } : "skip"
  );

  const myContacts = useQuery(
    api.trustedContacts.listMyContacts,
    sessionToken ? { sessionToken } : "skip"
  );

  const dismissAlert = useMutation(api.sos.dismissAlert);

  const openLocation = (lat?: number, lng?: number) => {
    if (!lat || !lng) return;
    Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`);
  };

  const handleDismiss = (alertId: string) => {
    if (!sessionToken) return;
    dismissAlert({ sessionToken, alertId: alertId as any });
  };

  const activeContactsCount =
    myContacts?.filter((c) => c.status === "accepted").length ?? 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>SafePass</Text>
        <Text style={styles.subGreeting}>
          {user ? `Hi, ${user.name.split(" ")[0]}` : ""}
        </Text>
      </View>

      {/* INCOMING SOS ALERTS — top priority, real-time */}
      {incomingAlerts && incomingAlerts.length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={styles.alertsSectionLabel}>🚨 Incoming Alerts</Text>
          {incomingAlerts.slice(0, 5).map((alert) => (
            <View key={alert._id} style={styles.alertCard}>
              <TouchableOpacity
                onPress={() => openLocation(alert.latitude, alert.longitude)}
                activeOpacity={0.8}
              >
                <View style={styles.alertTop}>
                  <Ionicons name="warning" size={20} color={COLORS.sos} />
                  <Text style={styles.alertName}>{alert.senderName}</Text>
                  <Text style={styles.alertTime}>{timeAgo(alert.triggeredAt)}</Text>
                  <TouchableOpacity
                    onPress={() => handleDismiss(alert._id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.dismissButton}
                  >
                    <Ionicons name="close" size={18} color={COLORS.muted} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                {alert.latitude && alert.longitude ? (
                  <View style={styles.alertLocationRow}>
                    <Ionicons name="location" size={14} color={COLORS.primary} />
                    <Text style={styles.alertLocationText}>
                      Tap to view location on map
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.alertNoLocation}>Location unavailable</Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* ACTIVE CHECK-IN BANNER */}
      {activeCheckIn && (
        <TouchableOpacity
          style={styles.checkinBanner}
          onPress={() => router.push("/(tabs)/checkin")}
          activeOpacity={0.8}
        >
          <Ionicons name="timer" size={20} color={COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.checkinBannerTitle}>Check-in Active</Text>
            <Text style={styles.checkinBannerSub}>{activeCheckIn.label}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
        </TouchableOpacity>
      )}

      {/* QUICK ACTIONS */}
      <Text style={styles.sectionLabel}>Quick Actions</Text>
      <View style={styles.cardsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(tabs)/checkin")}
        >
          <Ionicons name="timer-outline" size={26} color={COLORS.primary} />
          <Text style={styles.actionCardText}>Start Check-in</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/vault")}
        >
          <Ionicons name="lock-closed-outline" size={26} color={COLORS.primary} />
          <Text style={styles.actionCardText}>Evidence Vault</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.wideActionCard}
        onPress={() => router.push("/(tabs)/circle")}
      >
        <Ionicons name="people-outline" size={26} color={COLORS.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.actionCardText}>Trusted Circle</Text>
          <Text style={styles.actionCardSub}>{activeContactsCount} active</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
      </TouchableOpacity>

      {/* SOS SHORTCUT */}
      <TouchableOpacity
        style={styles.sosShortcut}
        onPress={() => router.push("/sos")}
        activeOpacity={0.85}
      >
        <Ionicons name="shield" size={22} color={COLORS.white} />
        <Text style={styles.sosShortcutText}>Emergency SOS</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg, paddingTop: 60, paddingBottom: SPACING.xl },
  header: { marginBottom: SPACING.xl + 4 },
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    fontFamily: FONT.medium,
    color: COLORS.white,
  },
  subGreeting: {
    fontSize: 15,
    color: COLORS.muted,
    fontFamily: FONT.regular,
    marginTop: 4,
  },

  alertsSection: { marginBottom: SPACING.lg },
  alertsSectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.sos,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  alertCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.sos,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: 10,
  },
  alertTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  alertName: { color: COLORS.white, fontWeight: "700", fontSize: 15, flex: 1 },
  alertTime: { color: COLORS.muted, fontSize: 12 },
  dismissButton: { paddingLeft: 4 },
  alertMessage: { color: COLORS.white, opacity: 0.85, fontSize: 14, marginBottom: 8 },
  alertLocationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  alertLocationText: { color: COLORS.primary, fontSize: 13, fontWeight: "600" },
  alertNoLocation: { color: COLORS.muted, fontSize: 12, fontStyle: "italic" },

  checkinBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  checkinBannerTitle: { color: COLORS.white, fontWeight: "700", fontSize: 14 },
  checkinBannerSub: { color: COLORS.muted, fontSize: 13, marginTop: 2 },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.muted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: SPACING.sm + 4,
  },
  cardsGrid: { flexDirection: "row", gap: SPACING.sm + 4, marginBottom: SPACING.sm + 4 },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg - 6,
    padding: SPACING.md + 2,
    gap: 8,
  },
  wideActionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg - 6,
    padding: SPACING.md + 2,
    marginBottom: SPACING.xl,
  },
  actionCardText: { color: COLORS.white, fontWeight: "600", fontSize: 14 },
  actionCardSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },

  sosShortcut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.sos,
    borderRadius: RADIUS.lg - 6,
    paddingVertical: SPACING.md + 2,
  },
  sosShortcutText: { color: COLORS.white, fontWeight: "800", fontSize: 16, letterSpacing: 0.5 },
});
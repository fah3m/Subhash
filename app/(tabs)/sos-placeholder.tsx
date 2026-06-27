import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";

// This is a placeholder — the real screen is at app/sos.tsx (modal)
// This file exists only so the tab slot compiles without error.
export default function SOSPlaceholder() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>SOS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" },
  text: { color: COLORS.white, fontSize: 18, fontWeight: "500" },
});

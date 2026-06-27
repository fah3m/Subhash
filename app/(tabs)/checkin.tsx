import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";

export default function CheckinScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Check-in</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" },
  text: { color: COLORS.white, fontSize: 18, fontWeight: "500" },
});

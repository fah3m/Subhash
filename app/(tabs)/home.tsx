// app/(tabs)/home.tsx
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING } from "@/constants/theme";

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Home</Text>
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
  text: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "500",
  },
});

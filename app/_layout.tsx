import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { COLORS } from "@/constants/theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor={COLORS.bg} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.bg },
          animation: "slide_from_bottom",
        }}
      >
        {/* Main tabs */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* SOS — slides up as a modal over the tabs */}
        <Stack.Screen
          name="sos"
          options={{
            presentation: "modal",
            headerShown: false,
            animation: "slide_from_bottom",
          }}
        />

        {/* Auth screens */}
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
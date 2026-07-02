import { Redirect } from "expo-router";
import { View, Text } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0A0A0A" }}>
        <Text style={{ color: "white" }}>Loading...</Text>
      </View>
    );
  }

  return user ? <Redirect href="/(tabs)/home" /> : <Redirect href="/auth/login" />;
}
import { useState, useCallback } from "react";
import * as Location from "expo-location";
import { Alert, Linking, Platform } from "react-native";

type LatLng = { latitude: number; longitude: number };

export function useLocation() {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const openSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings();
    }
  };

  const promptEnableServices = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      Alert.alert(
        "Turn On Location",
        "Location services are off. Please enable them to check in.",
        [
          { text: "Cancel", style: "cancel", onPress: () => resolve() },
          { text: "Open Settings", onPress: () => { openSettings(); resolve(); } },
        ],
        { cancelable: true, onDismiss: () => resolve() }
      );
    });
  }, []);

  const promptPermissionDenied = useCallback(() => {
    Alert.alert(
      "Location Permission Needed",
      "We need access to your location to complete check-in. Please enable it in Settings.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: openSettings },
      ]
    );
  }, []);

  /**
   * Call this at the START of every check-in.
   * Prompts for permission and/or enabling location services as needed.
   * Returns coords on success, or null — treat null as "block the check-in".
   */
  const requestLocationForCheckIn = useCallback(async (): Promise<LatLng | null> => {
    setIsFetching(true);
    try {
      // 1. System-level location services must be on
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        await promptEnableServices();
        return null;
      }

      // 2. Foreground permission — re-checked every call, prompts if not yet granted
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Location.requestForegroundPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        // OS already showed its native prompt above; if still denied
        // (e.g. previously "don't ask again"), send them to Settings.
        promptPermissionDenied();
        return null;
      }

      // 3. Fresh fix for this check-in
      const fresh = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: fresh.coords.latitude,
        longitude: fresh.coords.longitude,
      };
      setLocation(coords);
      return coords;
    } catch {
      Alert.alert("Couldn't Get Location", "We weren't able to determine your location. Please try again.");
      return null;
    } finally {
      setIsFetching(false);
    }
  }, [promptEnableServices, promptPermissionDenied]);

  return { location, isFetching, requestLocationForCheckIn };
}
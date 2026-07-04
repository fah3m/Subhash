import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";

export function useLocation() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function tryGetLocation() {
    try {
      // Check if location services are enabled at system level
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) return;

      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        await Location.requestForegroundPermissionsAsync();
        return;
      }

      // Try last known first
      const last = await Location.getLastKnownPositionAsync();
      if (last) {
        setLocation({
          latitude: last.coords.latitude,
          longitude: last.coords.longitude,
        });
      }

      // Then get fresh
      const fresh = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });
      setLocation({
        latitude: fresh.coords.latitude,
        longitude: fresh.coords.longitude,
      });

      // Got it — stop retrying
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch {
      // Still unavailable — will retry
    }
  }

  useEffect(() => {
    tryGetLocation();

    // Retry every 5 seconds until we get a location
    intervalRef.current = setInterval(tryGetLocation, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { location };
}
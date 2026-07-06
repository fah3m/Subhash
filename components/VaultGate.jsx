import { useState, useEffect, useRef } from "react";
import { AppState } from "react-native";
import * as ScreenCapture from "expo-screen-capture";
import VaultLockScreen from "./VaultLockScreen";
import VaultScreen from "@/app/(tabs)/VaultScreenContent";

export default function VaultGate() {
  const [unlocked, setUnlocked] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (
        appState.current === "active" &&
        (nextState === "background" || nextState === "inactive")
      ) {
        setUnlocked(false);
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (unlocked) {
      ScreenCapture.preventScreenCaptureAsync();
    } else {
      ScreenCapture.allowScreenCaptureAsync();
    }
    return () => {
      ScreenCapture.allowScreenCaptureAsync();
    };
  }, [unlocked]);

  if (!unlocked) {
    return <VaultLockScreen onUnlock={() => setUnlocked(true)} />;
  }

  return <VaultScreen />;
}
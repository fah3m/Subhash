import { Platform } from "react-native";

export const COLORS = {
  // Backgrounds
  bg: "#0A0A0F",
  surface: "#13131A",
  surfaceHigh: "#1C1C26",

  // Text
  white: "#F0F0F5",
  muted: "#8B95A1",

  // Tabs
  tabInactive: "#555B66",

  // Borders
  border: "#22222E",

  // SOS
  sos: "#C0392B",
  sosRing: "#C0392B",

  // Status
  success: "#27AE60",
  warning: "#E67E22",

  primary: "#D4A017",    // ← add this
};

export const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 88 : 80;

export const FONT = {
  regular: Platform.OS === "ios" ? "System" : "sans-serif",
  medium: Platform.OS === "ios" ? "System" : "sans-serif-medium",
  mono: Platform.OS === "ios" ? "Courier New" : "monospace",
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 9999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
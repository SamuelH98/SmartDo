import React, { createContext, useContext, useState, useEffect } from "react";
import { Appearance, useColorScheme } from "react-native";
import { StyleSheet } from "react-native";

// Common task interface for all screens
export interface BaseTask {
  id: string;
  title: string;
  preview?: string;
  completed: boolean;
  dueDate?: string;
}

// Define color schemes
export interface ThemeColors {
  // Background colors
  background: string;
  card: string;
  modal: string;
  overlay: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Border colors
  border: string;
  borderLight: string;

  // Status colors
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;

  // Screen-specific colors (Things 3 inspired)
  inbox: string;
  today: string;
  upcoming: string;
  anytime: string;
  someday: string;
  logbook: string;

  // UI elements
  shadow: string;
  checkbox: string;
  checkboxBorder: string;
}

// Light theme
const lightTheme: ThemeColors = {
  background: "#ffffff",
  card: "#ffffff",
  modal: "#ffffff",
  overlay: "rgba(0, 0, 0, 0.5)",

  text: "#111827",
  textSecondary: "#6b7280",
  textTertiary: "#9ca3af",
  textInverse: "#ffffff",

  border: "#e5e7eb",
  borderLight: "#f3f4f6",

  primary: "#3b82f6",
  secondary: "#6b7280",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",

  inbox: "#3b82f6",
  today: "#facc15",
  upcoming: "#ec4899",
  anytime: "#06b6d4",
  someday: "#d1d5db",
  logbook: "#4ade80",

  shadow: "rgba(0, 0, 0, 0.1)",
  checkbox: "#3b82f6",
  checkboxBorder: "#d1d5db",
};

// Dark theme
const darkTheme: ThemeColors = {
  background: "#1B1F25",
  card: "#1B1F25",
  modal: "#1B1F25",
  overlay: "rgba(255, 255, 255, 0.1)",

  text: "#D0D4DA",
  textSecondary: "#D0D4DA",
  textTertiary: "#D0D4DA",
  textInverse: "#000000",

  border: "#2d2d2d",
  borderLight: "#404040",

  primary: "#60a5fa",
  secondary: "#a1a1aa",
  success: "#34d399",
  warning: "#fbbf24",
  error: "#f87171",

  inbox: "#60a5fa",
  today: "#fbbf24",
  upcoming: "#f472b6",
  anytime: "#22d3ee",
  someday: "#6b7280",
  logbook: "#34d399",

  shadow: "rgba(255, 255, 255, 0.05)",
  checkbox: "#60a5fa",
  checkboxBorder: "#404040",
};

interface ThemeContextType {
  theme: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === "dark");

  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

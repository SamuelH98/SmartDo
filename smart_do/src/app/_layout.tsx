import { Stack } from "expo-router";
import "../../global.css";
import React from "react";
import { TasksProvider } from "@/context/TasksContext";
import { AreasProvider } from "@/context/AreasContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <TasksProvider>
          <AreasProvider>
            <Stack>
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                }}
              />
            </Stack>
          </AreasProvider>
        </TasksProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

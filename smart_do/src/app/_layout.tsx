import { Stack } from "expo-router";
import "../../global.css";
import React from "react";
import { TasksProvider } from "@/context/TasksContext";
import { AreasProvider } from "@/context/AreasContext";
import { ProjectsProvider } from "@/context/ProjectsContext";
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
            <ProjectsProvider>
              <Stack>
                <Stack.Screen
                  name="(tabs)"
                  options={{
                    headerShown: false,
                  }}
                />
              </Stack>
            </ProjectsProvider>
          </AreasProvider>
        </TasksProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

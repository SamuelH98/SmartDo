import { Stack } from "expo-router";
import "../../global.css";
import React from "react";
import { TasksProvider } from "@/context/TasksContext";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  return (
    <TasksProvider>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </TasksProvider>
  );
}
import { Stack } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

function ThemedStackNavigator() {
  const { theme } = useTheme();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Home", headerShown: false }}
      />
      <Stack.Screen
        name="inbox"
        options={{
          title: "",
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
        }}
      />
      <Stack.Screen
        name="today"
        options={{
          title: "",
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
        }}
      />
      <Stack.Screen
        name="upcoming"
        options={{
          title: "",
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
        }}
      />
      <Stack.Screen
        name="anytime"
        options={{
          title: "",
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
        }}
      />
      <Stack.Screen
        name="someday"
        options={{
          title: "",
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
        }}
      />
      <Stack.Screen
        name="logbook"
        options={{
          title: "",
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
        }}
      />
      <Stack.Screen
        name="area"
        options={{
          title: "",
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "",
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
        }}
      />
    </Stack>
  );
}

export default function Layout() {
  return <ThemedStackNavigator />;
}

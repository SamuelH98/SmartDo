import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home", headerShown: false }} />
      <Stack.Screen 
        name="inbox" 
        options={{
          title: "",
          headerShown: true,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen 
        name="today" 
        options={{
          title: "",
          headerShown: true,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen 
        name="upcoming" 
        options={{
          title: "",
          headerShown: true,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen 
        name="logbook" 
        options={{
          title: "",
          headerShown: true,
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemePreferenceProvider } from "@/contexts/ThemePreferenceContext";

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemePreferenceProvider>
  );
}

function RootNavigator() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth/login"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen
          name="auth/signup"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

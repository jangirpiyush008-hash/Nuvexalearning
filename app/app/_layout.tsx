import React, { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider, useAuth } from "@/features/auth/AuthProvider";
import { ThemeMontageSplash } from "@/features/onboarding/ThemeMontageSplash";
import { ThemeProvider, useTheme } from "@/themes/ThemeProvider";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootGate() {
  const { session, loading } = useAuth();
  const { theme } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "(auth)";
    if (!session && !inAuth) {
      router.replace("/(auth)/welcome");
    } else if (
      session &&
      inAuth &&
      segments[1] !== "theme" &&
      segments[1] !== "profile-setup"
    ) {
      router.replace("/(tabs)/home");
    }
  }, [session, loading, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.surface, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.surface } }} />
    </View>
  );
}

export default function RootLayout() {
  // Single splash: the theme montage. AnimatedSplash was retired because it
  // played AFTER the montage and effectively replayed a single-theme version
  // of the splash, which felt repetitive.
  const [montageDone, setMontageDone] = useState(false);

  // Hide the native iOS splash as soon as JS is ready so the JS-side
  // montage is visible from the very first frame.
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <StatusBar style="light" />
            <RootGate />

            {!montageDone && (
              <ThemeMontageSplash onFinish={() => setMontageDone(true)} />
            )}
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

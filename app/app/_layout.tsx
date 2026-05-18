import React, { useEffect, useState, useCallback } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider, useAuth } from "@/features/auth/AuthProvider";
import { AnimatedSplash } from "@/features/onboarding/AnimatedSplash";
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
  // Two-stage splash: theme montage (first-launch only) → animated splash.
  const [montageDone, setMontageDone] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  const onAnimatedReady = useCallback(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <StatusBar style="light" />
            <RootGate />

            {/* First-launch montage. Self-skips after first run via stored flag. */}
            {!montageDone && (
              <ThemeMontageSplash onFinish={() => setMontageDone(true)} />
            )}

            {/* Theme-aware animated splash. Mounts after montage finishes. */}
            {montageDone && !splashDone && (
              <AnimatedSplash
                onFinish={() => setSplashDone(true)}
                onReady={onAnimatedReady}
              />
            )}
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

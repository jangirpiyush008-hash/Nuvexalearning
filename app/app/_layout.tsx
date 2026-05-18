import React, { useEffect, useState, useCallback } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider, useAuth } from "@/features/auth/AuthProvider";
import { AnimatedSplash } from "@/features/onboarding/AnimatedSplash";
import { ThemeProvider, useTheme } from "@/themes/ThemeProvider";

// Hold the native splash until we're ready to hand off to AnimatedSplash.
// No flicker between native icon → animated logo.
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
    } else if (session && inAuth && segments[1] !== "theme" && segments[1] !== "profile-setup") {
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
  const [splashDone, setSplashDone] = useState(false);

  // Called by AnimatedSplash on its first paint — that's when we let go of
  // the native splash. Single seamless handoff: native frame → animated frame.
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
            {!splashDone && (
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

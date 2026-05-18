import React from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ThemePicker } from "@/features/onboarding/ThemePicker";
import { useTheme } from "@/themes/ThemeProvider";
import { useAuth } from "@/features/auth/AuthProvider";

export default function ThemeSelect() {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const { session } = useAuth();

  return (
    <View style={[styles.root, { backgroundColor: theme.surface }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text
              style={{
                color: theme.textSubtle,
                fontSize: 12,
                fontWeight: "700",
                fontFamily: "Menlo",
                letterSpacing: 1.4,
              }}
            >
              ← BACK
            </Text>
          </Pressable>
        </View>
        <ThemePicker
          onSelect={async (id) => {
            await setTheme(id);
            // If user is already signed in (first-run signup / demo flow),
            // forward into the app. Otherwise just pop back to wherever.
            if (session) {
              router.replace("/(tabs)/home");
            } else {
              router.back();
            }
          }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 },
});

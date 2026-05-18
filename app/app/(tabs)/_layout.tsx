import { Tabs } from "expo-router";
import { Text } from "react-native";
import { Typography } from "@/designSystem";
import { useTheme } from "@/themes/ThemeProvider";

function TabLabel({ focused, label }: { focused: boolean; label: string }) {
  const { theme } = useTheme();
  const wantsGlow = theme.id === "neon-os" || theme.id === "marvel" || theme.id === "glass-3d";
  return (
    <Text
      style={{
        ...Typography.terminal,
        fontSize: 10,
        color: focused ? theme.primary : theme.textMuted,
        textShadowColor: focused && wantsGlow ? theme.primary : "transparent",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: focused && wantsGlow ? 6 : 0,
        fontFamily: theme.id === "retro-90s" ? "Courier" : undefined,
      }}
    >
      {label}
    </Text>
  );
}

function TabIcon({ glyph, focused }: { glyph: string; focused: boolean }) {
  const { theme } = useTheme();
  return <Text style={{ fontSize: 18, color: focused ? theme.primary : theme.textMuted }}>{glyph}</Text>;
}

export default function TabsLayout() {
  const { theme } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: theme.effects.pixelGrid ? 2 : 1,
          height: 84,
          paddingTop: 8,
          paddingBottom: 24,
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        sceneStyle: { backgroundColor: theme.surface },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Discover",
          tabBarLabel: ({ focused }) => <TabLabel focused={focused} label="DISCOVER" />,
          tabBarIcon: ({ focused }) => <TabIcon glyph="◎" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarLabel: ({ focused }) => <TabLabel focused={focused} label="LIBRARY" />,
          tabBarIcon: ({ focused }) => <TabIcon glyph="▤" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="voices"
        options={{
          title: "Voices",
          tabBarLabel: ({ focused }) => <TabLabel focused={focused} label="VOICES" />,
          tabBarIcon: ({ focused }) => <TabIcon glyph="✦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Credits",
          tabBarLabel: ({ focused }) => <TabLabel focused={focused} label="CREDITS" />,
          tabBarIcon: ({ focused }) => <TabIcon glyph="₹" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: ({ focused }) => <TabLabel focused={focused} label="ME" />,
          tabBarIcon: ({ focused }) => <TabIcon glyph="◉" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

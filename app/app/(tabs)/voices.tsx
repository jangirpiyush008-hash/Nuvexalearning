import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  GradientChip,
  NuvexaButton,
  NuvexaCard,
  Spacing,
  TerminalLabel,
  Typography,
  VoiceCard,
} from "@/designSystem";
import { useTheme } from "@/themes/ThemeProvider";
import { ThemeOverlay } from "@/themes/ThemeOverlay";

const OUTCOMES = ["Shipped", "Hired", "Raised", "Promoted", "Quit", "Saved 10h/wk", "First $1"];

const DEMO_VOICES = [
  {
    id: "v1",
    authorName: "Arjun Kapoor",
    authorHandle: "arjun_ml",
    text: "Used the RAG patterns from Lesson 4 to ship our first prod feature. Customers can now ask our docs directly. Took 2 weeks instead of 2 months.",
    outcomeTags: ["Shipped", "First $1"],
    helpfulCount: 142,
    createdAt: new Date().toISOString(),
    verifiedCompleter: true,
  },
  {
    id: "v2",
    authorName: "Priya Mehta",
    authorHandle: "priya_ai",
    text: "Quit my consulting job last month. The pricing module gave me the confidence to charge enterprise rates for my own SaaS.",
    outcomeTags: ["Quit", "Raised"],
    helpfulCount: 88,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    verifiedCompleter: true,
  },
  {
    id: "v3",
    authorName: "Neha Verma",
    authorHandle: "neha_nocode",
    text: "Went from 0 to launching my AI tool in 21 days. The 'Pick the right wedge' lesson is unreasonably good.",
    outcomeTags: ["Shipped", "Saved 10h/wk"],
    helpfulCount: 64,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export default function VoicesFeed() {
  const { theme } = useTheme();
  const [draft, setDraft] = useState("");
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (tag: string) =>
    setPicked((p) => (p.includes(tag) ? p.filter((x) => x !== tag) : [...p, tag]));

  const post = () => {
    if (!draft.trim()) return Alert.alert("Empty", "Write something first.");
    Alert.alert(
      "Posted (demo)",
      "In prod this runs through Claude moderation, then publishes if approved.",
    );
    setDraft("");
    setPicked([]);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.surface }]}>
      <ThemeOverlay />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TerminalLabel>VOICES · THE_WALL</TerminalLabel>
          <Text style={[Typography.caption, { color: theme.textMuted }]}>
            {DEMO_VOICES.length} this week
          </Text>
        </View>
        <Text
          style={{
            ...Typography.displayL,
            color: theme.text,
            marginTop: Spacing.md,
            fontSize: 28,
            fontWeight: theme.displayWeight,
            textTransform: theme.uppercase ? "uppercase" : "none",
            fontStyle: theme.italicHeadlines ? "italic" : "normal",
          }}
        >
          What did you ship?
        </Text>
        <Text style={[Typography.body, { color: theme.textSubtle, marginTop: Spacing.xs }]}>
          Show your work. Tag the outcome. Top voices earn pinned spots.
        </Text>

        <NuvexaCard style={{ marginTop: Spacing.lg }}>
          <TextInput
            style={[Typography.body, { color: theme.text, minHeight: 90, textAlignVertical: "top" }]}
            multiline
            placeholder="Tell us what changed since the course..."
            placeholderTextColor={theme.textMuted}
            value={draft}
            onChangeText={setDraft}
          />
          <View style={[styles.outcomeRow, { borderTopColor: theme.border }]}>
            {OUTCOMES.map((o) => (
              <Pressable
                key={o}
                onPress={() => toggle(o)}
                style={{ marginRight: 6, marginBottom: 6 }}
              >
                <GradientChip label={o} variant={picked.includes(o) ? "solid" : "outline"} />
              </Pressable>
            ))}
          </View>
          <View style={styles.composerFooter}>
            <Text style={[Typography.caption, { color: theme.textMuted, flex: 1 }]}>
              {draft.length}/2000 · moderated by Claude
            </Text>
            <View style={{ width: 140 }}>
              <NuvexaButton label="Post" onPress={post} />
            </View>
          </View>
        </NuvexaCard>

        <View style={{ marginTop: Spacing.xl }}>
          <TerminalLabel color={theme.textMuted}>TOP_VOICE_THIS_WEEK</TerminalLabel>
          <View
            style={[
              styles.topVoiceCard,
              {
                backgroundColor: theme.surfaceCard,
                borderRadius: theme.cardRadius,
                borderColor: theme.primary,
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.55,
                shadowRadius: 24,
                elevation: 12,
              },
            ]}
          >
            <View style={[styles.topVoiceCrown, { backgroundColor: theme.primary }]}>
              <Text style={[Typography.terminal, { color: theme.onPrimary, fontSize: 10 }]}>
                ★ TOP VOICE
              </Text>
            </View>
            <Text style={[Typography.bodyL, { color: theme.text, fontWeight: "500", marginTop: Spacing.md, lineHeight: 25 }]}>
              "{DEMO_VOICES[0].text}"
            </Text>
            <View style={styles.topVoiceFooter}>
              <Text style={[Typography.caption, { color: theme.textSubtle }]}>
                {DEMO_VOICES[0].authorName} · @{DEMO_VOICES[0].authorHandle}
              </Text>
              <Pressable
                onPress={() => Alert.alert("Helpful!", "+1 logged. Top voices earn pinned spots.")}
              >
                <Text style={[Typography.mono, { color: theme.primary }]}>
                  ↑ {DEMO_VOICES[0].helpfulCount}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={{ marginTop: Spacing.xl }}>
          <TerminalLabel color={theme.textMuted}>RECENT</TerminalLabel>
          <View style={{ marginTop: Spacing.sm }}>
            {DEMO_VOICES.slice(1).map((v) => (
              <Pressable
                key={v.id}
                onPress={() => Alert.alert("Helpful!", `+1 helpful logged on @${v.authorHandle}'s voice.`)}
              >
                <VoiceCard
                  authorName={v.authorName}
                  authorHandle={v.authorHandle}
                  text={v.text}
                  outcomeTags={v.outcomeTags}
                  helpfulCount={v.helpfulCount}
                  createdAt={v.createdAt}
                  verifiedCompleter={v.verifiedCompleter}
                />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  outcomeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  composerFooter: {
    marginTop: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topVoiceCard: {
    marginTop: Spacing.sm,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  topVoiceCrown: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  topVoiceFooter: {
    marginTop: Spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  NuvexaButton,
  NuvexaCard,
  RewardBadge,
  Spacing,
  TerminalLabel,
  Typography,
} from "@/designSystem";
import { useAuth } from "@/features/auth/AuthProvider";
import { fetchMyWallet } from "@/core/supabase/queries";
import { useTheme } from "@/themes/ThemeProvider";
import { ThemeOverlay } from "@/themes/ThemeOverlay";
import type { CreditsWallet } from "@/core/models";

export default function Wallet() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [wallet, setWallet] = useState<CreditsWallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchMyWallet(user.id)
      .then((w) => setWallet(w ?? null))
      .catch(() => setWallet(null))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.surface }]}>
      <ThemeOverlay />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TerminalLabel>WALLET · AI_CREDITS</TerminalLabel>
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
          Credits
        </Text>
        <Text style={[Typography.body, { color: theme.textSubtle, marginTop: Spacing.xs }]}>
          Earn by passing tests. Spend on partner offers and addons.
        </Text>

        {loading ? (
          <View style={{ marginTop: Spacing.xxl, alignItems: "center" }}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : (
          <>
            <View
              style={[
                styles.balanceCard,
                {
                  backgroundColor: theme.surfaceCard,
                  borderRadius: theme.cardRadius,
                  borderColor: theme.primary,
                  borderWidth: theme.effects.pixelGrid ? 2 : 1,
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.55,
                  shadowRadius: 24,
                  elevation: 12,
                },
              ]}
            >
              <TerminalLabel color={theme.textMuted}>CURRENT_BALANCE</TerminalLabel>
              <View style={{ height: Spacing.md }} />
              <RewardBadge amountPaise={wallet?.balance_paise ?? 0} />
              <View style={[styles.balanceFooter, { borderTopColor: theme.border }]}>
                <View>
                  <Text style={[Typography.caption, { color: theme.textMuted }]}>
                    Lifetime earned
                  </Text>
                  <Text style={[Typography.titleS, { color: theme.text, marginTop: 4 }]}>
                    ₹{((wallet?.lifetime_earned_paise ?? 0) / 100).toLocaleString("en-IN")}
                  </Text>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View>
                  <Text style={[Typography.caption, { color: theme.textMuted }]}>
                    Lifetime spent
                  </Text>
                  <Text style={[Typography.titleS, { color: theme.text, marginTop: 4 }]}>
                    ₹{((wallet?.lifetime_spent_paise ?? 0) / 100).toLocaleString("en-IN")}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ marginTop: Spacing.xl }}>
              <TerminalLabel color={theme.textMuted}>HOW_TO_EARN</TerminalLabel>
              <NuvexaCard style={{ marginTop: Spacing.sm }}>
                <View style={styles.earnRow}>
                  <View style={styles.earnTier}>
                    <Text style={{ ...Typography.mono, color: theme.primary, fontSize: 18, fontWeight: "700" }}>
                      95%+
                    </Text>
                    <Text style={[Typography.titleS, { color: theme.primary, marginTop: 2 }]}>
                      ₹10,000
                    </Text>
                  </View>
                  <Text style={[Typography.bodyS, { color: theme.textSubtle, flex: 1 }]}>
                    Top performer. Capped at 100/month per course. Plus certificate.
                  </Text>
                </View>
                <View style={[styles.earnSep, { backgroundColor: theme.border }]} />
                <View style={styles.earnRow}>
                  <View style={styles.earnTier}>
                    <Text style={{ ...Typography.mono, color: theme.textSubtle, fontSize: 18, fontWeight: "700" }}>
                      70%+
                    </Text>
                    <Text style={[Typography.titleS, { color: theme.text, marginTop: 2 }]}>
                      ₹200
                    </Text>
                  </View>
                  <Text style={[Typography.bodyS, { color: theme.textSubtle, flex: 1 }]}>
                    Pass tier. Plus certificate + 1-month AI agent trial.
                  </Text>
                </View>
              </NuvexaCard>
            </View>

            <View style={{ marginTop: Spacing.xl }}>
              <TerminalLabel color={theme.textMuted}>REDEEM</TerminalLabel>
              <NuvexaCard style={{ marginTop: Spacing.sm }}>
                <Text style={[Typography.titleS, { color: theme.text }]}>
                  Spend on courses, partner tools, AI credits.
                </Text>
                <Text style={[Typography.body, { color: theme.textSubtle, marginTop: Spacing.xs }]}>
                  Coming next: redeem AI Credits at checkout, or against the ₹99 test-retake fee.
                </Text>
                <View style={{ height: Spacing.md }} />
                <NuvexaButton
                  label="Browse offers"
                  variant="secondary"
                  onPress={() =>
                    Alert.alert(
                      "Coming soon",
                      "Partner offers in v0.2 — Razorpay credits, OpenAI API top-ups, bundles.",
                    )
                  }
                />
              </NuvexaCard>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
  balanceCard: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
  },
  balanceFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  divider: { width: 1, height: 32 },
  earnRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  earnTier: { alignItems: "flex-start", minWidth: 90 },
  earnSep: { height: 1, marginVertical: Spacing.md },
});

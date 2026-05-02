import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useI18n } from "@/context/I18nContext";
import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

function healthLabel(status: string, t: (k: any) => string) {
  switch (status) {
    case "available": return { label: t("healthConnected"), icon: "✅", color: "#16a34a" };
    case "checking": return { label: t("healthChecking"), icon: "⏳", color: "#94a3b8" };
    case "denied": return { label: t("healthDenied"), icon: "❌", color: "#ef4444" };
    case "unavailable": return { label: t("healthUnavailable"), icon: "⚠️", color: "#f59e0b" };
    default: return { label: t("healthWeb"), icon: "📱", color: "#94a3b8" };
  }
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, healthStatus, toggleWheelchairMode, refreshHealthData } = useUser();
  const { t, lang, setLang, isRTL } = useI18n();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 24;
  const health = healthLabel(healthStatus, t);

  const nav = [
    { icon: "🏆", label: t("leaderboard"), route: "/leaderboard", bg: "#fef3c7", iconBg: "#f59e0b" },
    { icon: "👥", label: t("friends"), route: "/friends", bg: colors.accent, iconBg: colors.primary },
    { icon: "📊", label: t("reports"), route: "/reports", bg: "#ede9fe", iconBg: "#7c3aed" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad }}>

        {/* Hero */}
        <LinearGradient
          colors={[colors.primary + "25", colors.background]}
          style={[styles.hero, { paddingTop: topPad + 8 }]}
        >
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
            hitSlop={12}
          >
            <Text style={[styles.backIcon, { color: colors.foreground }]}>
              {isRTL ? "→" : "←"}
            </Text>
            <Text style={[styles.backLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              {t("dashboard")}
            </Text>
          </Pressable>

          <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Inter_700Bold", textAlign: isRTL ? "right" : "left" }]}>
            {t("settings")}
          </Text>

          {/* Profile card */}
          <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.profileAvatar, { backgroundColor: user.color }]}>
              <Text style={[styles.profileInitials, { fontFamily: "Inter_700Bold" }]}>
                {user.initials}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                {user.name}
              </Text>
              <Text style={[styles.profileSteps, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                {user.steps.today.toLocaleString()} {t("steps")}
              </Text>
              <View style={[styles.streakRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                <Text style={styles.streakFire}>🔥</Text>
                <Text style={[styles.streakText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {user.steps.streak} {t("streak")}
                </Text>
              </View>
            </View>
            <View style={[styles.goalCircle, { borderColor: colors.primary + "40" }]}>
              <Text style={[styles.goalPct, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                {Math.round(Math.min(user.steps.today / user.steps.goal, 1) * 100)}%
              </Text>
              <Text style={[styles.goalLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {t("goal")}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Navigation cards */}
        <View style={styles.section}>
          <View style={[styles.navGrid, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            {nav.map((item) => (
              <Pressable
                key={item.route}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(item.route as any);
                }}
                style={({ pressed }) => [
                  styles.navCard,
                  { backgroundColor: item.bg, opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] },
                ]}
              >
                <View style={[styles.navIconCircle, { backgroundColor: item.iconBg }]}>
                  <Text style={styles.navIcon}>{item.icon}</Text>
                </View>
                <Text style={[styles.navCardLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Language toggle */}
        <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.settingsCardTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            {t("language").toUpperCase()}
          </Text>
          <View style={[styles.langRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            {(["en", "ar"] as const).map((l) => (
              <Pressable
                key={l}
                onPress={async () => {
                  await Haptics.selectionAsync();
                  setLang(l);
                }}
                style={[
                  styles.langBtn,
                  {
                    backgroundColor: lang === l ? colors.primary : colors.muted,
                    flex: 1,
                  },
                ]}
              >
                <Text style={[styles.langFlag]}>
                  {l === "en" ? "🇬🇧" : "🇸🇦"}
                </Text>
                <Text
                  style={[
                    styles.langBtnText,
                    {
                      color: lang === l ? colors.primaryForeground : colors.mutedForeground,
                      fontFamily: lang === l ? "Inter_700Bold" : "Inter_400Regular",
                    },
                  ]}
                >
                  {l === "en" ? t("english") : t("arabic")}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Accessibility */}
        <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.settingsCardTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            {t("accessibility").toUpperCase()}
          </Text>
          <View style={[styles.settingsRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Text style={styles.settingsRowIcon}>♿</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingsRowTitle, { color: colors.foreground, fontFamily: "Inter_500Medium", textAlign: isRTL ? "right" : "left" }]}>
                {t("wheelchairMode")}
              </Text>
              <Text style={[styles.settingsRowSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: isRTL ? "right" : "left" }]}>
                {t("wheelchairSub")}
              </Text>
            </View>
            <Switch
              value={user.isWheelchairMode}
              onValueChange={async () => {
                await Haptics.selectionAsync();
                toggleWheelchairMode();
              }}
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Apple Health */}
        <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.settingsCardTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            {t("healthIntegration").toUpperCase()}
          </Text>
          <View style={[styles.settingsRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Text style={styles.settingsRowIcon}>{health.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingsRowTitle, { color: colors.foreground, fontFamily: "Inter_500Medium", textAlign: isRTL ? "right" : "left" }]}>
                {t("healthIntegration")}
              </Text>
              <Text style={[styles.settingsRowSub, { color: health.color, fontFamily: "Inter_400Regular", textAlign: isRTL ? "right" : "left" }]}>
                {health.label}
              </Text>
            </View>
            {healthStatus === "available" && (
              <Pressable
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  await refreshHealthData();
                }}
                style={[styles.refreshChip, { backgroundColor: colors.muted }]}
              >
                <Text style={[styles.refreshChipText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  {t("refresh")}
                </Text>
              </Pressable>
            )}
          </View>
          {(healthStatus === "denied" || healthStatus === "web") && (
            <View style={[styles.healthNote, { backgroundColor: healthStatus === "denied" ? "#fef3c7" : colors.muted }]}>
              <Text style={[styles.healthNoteText, { color: healthStatus === "denied" ? "#92400e" : colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: isRTL ? "right" : "left" }]}>
                {healthStatus === "web" ? t("scanQRPhone") : t("motionDenied")}
              </Text>
            </View>
          )}
        </View>

        {/* About */}
        <View style={[styles.aboutCard, { backgroundColor: colors.accent, borderColor: colors.primary + "30" }]}>
          <Text style={[styles.aboutTitle, { color: colors.accentForeground, fontFamily: "Inter_700Bold", textAlign: isRTL ? "right" : "left" }]}>
            {t("howItWorks")}
          </Text>
          <Text style={[styles.aboutText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: isRTL ? "right" : "left" }]}>
            {t("howItWorksText")}
          </Text>
          <Text style={[styles.aboutNote, { color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: isRTL ? "right" : "left" }]}>
            {t("pocNote")}
          </Text>
          <View style={[styles.aboutMeta, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Text style={[styles.aboutMetaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              v1.0 · StepConnect PoC
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  backIcon: { fontSize: 20 },
  backLabel: { fontSize: 15 },
  pageTitle: { fontSize: 28, marginBottom: 4 },
  profileCard: { flexDirection: "row", alignItems: "center", padding: 18, borderRadius: 20, borderWidth: 1, gap: 14, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  profileAvatar: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  profileInitials: { color: "#fff", fontSize: 22 },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 18 },
  profileSteps: { fontSize: 15 },
  streakRow: { alignItems: "center", gap: 4 },
  streakFire: { fontSize: 13 },
  streakText: { fontSize: 12 },
  goalCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, alignItems: "center", justifyContent: "center", gap: 1 },
  goalPct: { fontSize: 16 },
  goalLabel: { fontSize: 10 },
  section: { paddingHorizontal: 20, marginTop: 20 },
  navGrid: { gap: 10 },
  navCard: { flex: 1, alignItems: "center", paddingVertical: 18, borderRadius: 18, gap: 10 },
  navIconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  navIcon: { fontSize: 22 },
  navCardLabel: { fontSize: 13 },
  settingsCard: { marginHorizontal: 20, marginTop: 14, borderRadius: 18, borderWidth: 1, padding: 16, gap: 14 },
  settingsCardTitle: { fontSize: 11, letterSpacing: 0.8 },
  langRow: { gap: 10 },
  langBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 14 },
  langFlag: { fontSize: 18 },
  langBtnText: { fontSize: 14 },
  settingsRow: { alignItems: "center", gap: 12 },
  settingsRowIcon: { fontSize: 22, width: 32, textAlign: "center" },
  settingsRowTitle: { fontSize: 15 },
  settingsRowSub: { fontSize: 12, marginTop: 2 },
  refreshChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  refreshChipText: { fontSize: 13 },
  healthNote: { borderRadius: 10, padding: 12, marginTop: 4 },
  healthNoteText: { fontSize: 12, lineHeight: 18 },
  aboutCard: { marginHorizontal: 20, marginTop: 14, borderRadius: 18, borderWidth: 1, padding: 18, gap: 10 },
  aboutTitle: { fontSize: 16 },
  aboutText: { fontSize: 13, lineHeight: 20 },
  aboutNote: { fontSize: 11, lineHeight: 17, fontStyle: "italic" },
  aboutMeta: { marginTop: 4 },
  aboutMetaText: { fontSize: 11 },
});

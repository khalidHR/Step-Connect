import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WeeklyChart } from "@/components/WeeklyChart";
import { useI18n } from "@/context/I18nContext";
import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

type Period = "week" | "month";

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { t, isRTL } = useI18n();
  const [period, setPeriod] = useState<Period>("week");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 24;

  const weeklyTotal = user.steps.weekly.reduce((s, n) => s + n, 0);
  const weeklyAvg = Math.round(weeklyTotal / Math.max(user.steps.weekly.filter((d) => d > 0).length, 1));
  const weeklyBest = Math.max(...user.steps.weekly);
  const goalsHit = user.steps.weekly.filter((d) => d >= user.steps.goal).length;

  const monthlyBarData = Array.from({ length: 4 }, (_, i) => {
    const mults = [0.85, 1.1, 0.92, 1.05];
    return Math.round((weeklyTotal / 7) * 7 * mults[i]);
  });

  const insights = [
    { label: t("bestDay"), value: `${weeklyBest.toLocaleString()} ${t("steps")}`, color: colors.primary },
    { label: t("goalsThisWeek"), value: `${goalsHit} / 7 ${t("days")}`, color: goalsHit >= 5 ? colors.primary : colors.mutedForeground },
    { label: t("weeklyAvg"), value: `${weeklyAvg.toLocaleString()} ${t("stepsPerDay")}`, color: colors.foreground },
    { label: t("monthlyTotal"), value: `${user.steps.monthly.toLocaleString()}`, color: colors.foreground },
  ];

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: bottomPad }]}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]} hitSlop={12}>
        <Text style={[styles.backIcon, { color: colors.foreground }]}>{isRTL ? "→" : "←"}</Text>
        <Text style={[styles.backLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{t("settings")}</Text>
      </Pressable>

      <View>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold", textAlign: isRTL ? "right" : "left" }]}>
          {t("reports")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: isRTL ? "right" : "left" }]}>
          {t("activityHistory")}
        </Text>
      </View>

      <View style={[styles.toggle, { backgroundColor: colors.muted }]}>
        {(["week", "month"] as Period[]).map((p) => (
          <Pressable
            key={p}
            onPress={() => setPeriod(p)}
            style={[styles.toggleOption, period === p && { backgroundColor: colors.card, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 }]}
          >
            <Text style={[styles.toggleText, { color: period === p ? colors.foreground : colors.mutedForeground, fontFamily: period === p ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
              {p === "week" ? t("thisWeekLabel") : t("thisMonthLabel")}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.chartCardHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View>
            <Text style={[styles.chartTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold", textAlign: isRTL ? "right" : "left" }]}>
              {period === "week" ? t("dailySteps") : t("weeklySteps")}
            </Text>
            <Text style={[styles.chartTotal, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
              {period === "week" ? weeklyTotal.toLocaleString() : user.steps.monthly.toLocaleString()}
            </Text>
            <Text style={[styles.chartTotalLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {period === "week" ? t("thisWeekLabel") : t("thisMonthLabel")}
            </Text>
          </View>
          <View style={[styles.goalsBadge, { backgroundColor: goalsHit >= 5 ? colors.accent : colors.muted }]}>
            <Text style={[styles.goalsBadgeText, { color: goalsHit >= 5 ? colors.primary : colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
              {goalsHit} / 7
            </Text>
          </View>
        </View>
        <WeeklyChart
          data={period === "week" ? user.steps.weekly : monthlyBarData}
          goal={period === "week" ? user.steps.goal : user.steps.goal * 7}
          height={140}
        />
      </View>

      <View style={styles.insightsGrid}>
        {insights.map((item, i) => (
          <View key={i} style={[styles.insightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.insightValue, { color: item.color, fontFamily: "Inter_700Bold", textAlign: isRTL ? "right" : "left" }]}>
              {item.value}
            </Text>
            <Text style={[styles.insightLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: isRTL ? "right" : "left" }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.milestoneCard, { backgroundColor: colors.accent, borderColor: colors.primary + "30" }]}>
        <Text style={[styles.milestoneTitle, { color: colors.accentForeground, fontFamily: "Inter_700Bold", textAlign: isRTL ? "right" : "left" }]}>
          {t("milestones")}
        </Text>
        {[
          { label: `${user.steps.monthly.toLocaleString()} ${t("totalSteps")}`, done: true },
          { label: user.steps.today >= 10000 ? "10,000 step day achieved!" : `10k goal: ${user.steps.today.toLocaleString()} / 10,000`, done: user.steps.today >= 10000 },
          { label: `${user.steps.streak} ${t("streak")}`, done: user.steps.streak >= 7 },
        ].map((m, i) => (
          <View key={i} style={[styles.milestoneRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Text style={styles.milestoneDot}>{m.done ? "✅" : "⬜"}</Text>
            <Text style={[styles.milestoneLabel, { color: colors.accentForeground, fontFamily: "Inter_500Medium", textAlign: isRTL ? "right" : "left" }]}>
              {m.label}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  backIcon: { fontSize: 20 },
  backLabel: { fontSize: 15 },
  title: { fontSize: 26 },
  subtitle: { fontSize: 14, marginTop: 2 },
  toggle: { flexDirection: "row", borderRadius: 14, padding: 4 },
  toggleOption: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: "center" },
  toggleText: { fontSize: 14 },
  chartCard: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 12 },
  chartCardHeader: { alignItems: "flex-start", justifyContent: "space-between" },
  chartTitle: { fontSize: 15 },
  chartTotal: { fontSize: 32 },
  chartTotalLabel: { fontSize: 13 },
  goalsBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: "flex-start" },
  goalsBadgeText: { fontSize: 13 },
  insightsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  insightCard: { width: "48%", padding: 16, borderRadius: 16, borderWidth: 1, gap: 4 },
  insightValue: { fontSize: 15 },
  insightLabel: { fontSize: 12 },
  milestoneCard: { borderRadius: 18, borderWidth: 1, padding: 18, gap: 12 },
  milestoneTitle: { fontSize: 16 },
  milestoneRow: { alignItems: "center", gap: 10 },
  milestoneDot: { fontSize: 18 },
  milestoneLabel: { flex: 1, fontSize: 14 },
});

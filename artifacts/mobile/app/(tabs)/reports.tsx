import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WeeklyChart } from "@/components/WeeklyChart";
import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

type Period = "week" | "month";

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [period, setPeriod] = useState<Period>("week");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : 100;

  const weeklyData = user.steps.weekly;
  const weeklyTotal = weeklyData.reduce((s, n) => s + n, 0);
  const weeklyAvg = Math.round(weeklyTotal / weeklyData.filter((d) => d > 0).length);
  const weeklyBest = Math.max(...weeklyData);
  const weeklyGoalDays = weeklyData.filter((d) => d >= user.steps.goal).length;

  const monthlyAvg = Math.round(user.steps.monthly / 30);
  const monthlyBest = weeklyBest * 1.3;

  const monthlyBarData = Array.from({ length: 4 }, (_, i) => {
    const weekMultipliers = [0.85, 1.1, 0.92, weeklyTotal / 70000 > 1 ? 1 : weeklyTotal / 70000 + 0.05];
    return Math.round((weeklyTotal / 7) * 7 * weekMultipliers[i]);
  });

  const insights = [
    {
      label: "Best day this week",
      value: `${weeklyBest.toLocaleString()} steps`,
      color: colors.primary,
    },
    {
      label: "Goals hit this week",
      value: `${weeklyGoalDays} / 7 days`,
      color: weeklyGoalDays >= 5 ? colors.primary : colors.mutedForeground,
    },
    {
      label: "Weekly average",
      value: `${weeklyAvg.toLocaleString()} steps/day`,
      color: colors.foreground,
    },
    {
      label: "Monthly total",
      value: `${user.steps.monthly.toLocaleString()} steps`,
      color: colors.foreground,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: bottomPad },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            { color: colors.foreground, fontFamily: "Inter_700Bold" },
          ]}
        >
          Reports
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
        >
          Your activity history
        </Text>
      </View>

      <View style={[styles.toggle, { backgroundColor: colors.muted }]}>
        {(["week", "month"] as Period[]).map((p) => (
          <Pressable
            key={p}
            onPress={() => setPeriod(p)}
            style={[
              styles.toggleOption,
              period === p && { backgroundColor: colors.card, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                {
                  color: period === p ? colors.foreground : colors.mutedForeground,
                  fontFamily: period === p ? "Inter_600SemiBold" : "Inter_400Regular",
                },
              ]}
            >
              {p === "week" ? "This Week" : "This Month"}
            </Text>
          </Pressable>
        ))}
      </View>

      <View
        style={[
          styles.chartCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text
          style={[
            styles.chartTitle,
            { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
          ]}
        >
          {period === "week" ? "Daily Steps" : "Weekly Steps"}
        </Text>
        <Text
          style={[
            styles.chartTotal,
            { color: colors.primary, fontFamily: "Inter_700Bold" },
          ]}
        >
          {period === "week"
            ? weeklyTotal.toLocaleString()
            : user.steps.monthly.toLocaleString()}
        </Text>
        <Text
          style={[
            styles.chartTotalLabel,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
        >
          total steps {period === "week" ? "this week" : "this month"}
        </Text>

        <View style={styles.chartWrapper}>
          <WeeklyChart
            data={period === "week" ? weeklyData : monthlyBarData}
            goal={period === "week" ? user.steps.goal : user.steps.goal * 7}
            height={150}
          />
        </View>
      </View>

      <View style={styles.insightsGrid}>
        {insights.map((insight, idx) => (
          <View
            key={idx}
            style={[
              styles.insightCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.insightValue,
                { color: insight.color, fontFamily: "Inter_700Bold" },
              ]}
            >
              {insight.value}
            </Text>
            <Text
              style={[
                styles.insightLabel,
                { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
              ]}
            >
              {insight.label}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.milestoneCard,
          { backgroundColor: colors.accent, borderColor: colors.primary + "30" },
        ]}
      >
        <Text
          style={[
            styles.milestoneTitle,
            { color: colors.accentForeground, fontFamily: "Inter_700Bold" },
          ]}
        >
          Milestones
        </Text>
        {[
          { label: "Total lifetime steps", value: user.steps.monthly.toLocaleString(), done: true },
          { label: "10,000 step day", value: user.steps.today >= 10000 ? "Achieved today!" : `${user.steps.today.toLocaleString()} / 10,000`, done: user.steps.today >= 10000 },
          { label: `${user.steps.streak} day streak`, value: `Current streak`, done: user.steps.streak >= 7 },
        ].map((m, i) => (
          <View key={i} style={styles.milestoneRow}>
            <Text style={styles.milestoneDot}>
              {m.done ? "✅" : "⬜"}
            </Text>
            <View style={styles.milestoneInfo}>
              <Text
                style={[
                  styles.milestoneLabel,
                  { color: colors.accentForeground, fontFamily: "Inter_500Medium" },
                ]}
              >
                {m.label}
              </Text>
              <Text
                style={[
                  styles.milestoneValue,
                  { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                ]}
              >
                {m.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 26,
  },
  subtitle: {
    fontSize: 14,
  },
  toggle: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 14,
  },
  chartCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 4,
  },
  chartTitle: {
    fontSize: 15,
  },
  chartTotal: {
    fontSize: 32,
  },
  chartTotalLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  chartWrapper: {
    marginTop: 8,
  },
  insightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  insightCard: {
    width: "48%",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  insightValue: {
    fontSize: 16,
  },
  insightLabel: {
    fontSize: 12,
  },
  milestoneCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  milestoneTitle: {
    fontSize: 16,
  },
  milestoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  milestoneDot: {
    fontSize: 18,
  },
  milestoneInfo: {
    flex: 1,
    gap: 2,
  },
  milestoneLabel: {
    fontSize: 14,
  },
  milestoneValue: {
    fontSize: 12,
  },
});

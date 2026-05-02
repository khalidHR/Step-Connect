import * as Haptics from "expo-haptics";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StepRing } from "@/components/StepRing";
import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addSteps } = useUser();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : 100;

  const kmWalked = ((user.steps.today * 0.762) / 1000).toFixed(2);
  const calBurned = Math.round(user.steps.today * 0.04);
  const todayIdx = new Date().getDay();
  const dayName = DAYS[todayIdx === 0 ? 6 : todayIdx - 1];

  const handleAddSteps = async (amount: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addSteps(amount);
  };

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
        <View>
          <Text
            style={[
              styles.greeting,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            {dayName}, let's move!
          </Text>
          <Text
            style={[
              styles.title,
              { color: colors.foreground, fontFamily: "Inter_700Bold" },
            ]}
          >
            StepConnect
          </Text>
        </View>
        <View style={[styles.streakBadge, { backgroundColor: colors.accent }]}>
          <Text style={styles.streakFire}>🔥</Text>
          <Text
            style={[
              styles.streakCount,
              {
                color: colors.accentForeground,
                fontFamily: "Inter_700Bold",
              },
            ]}
          >
            {user.steps.streak}
          </Text>
          <Text
            style={[
              styles.streakLabel,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            day streak
          </Text>
        </View>
      </View>

      <View style={styles.ringContainer}>
        <StepRing
          steps={user.steps.today}
          goal={user.steps.goal}
          size={230}
          strokeWidth={20}
        />
      </View>

      <View style={styles.statsRow}>
        <StatCard
          label="Distance"
          value={`${kmWalked} km`}
          colors={colors}
          accent
        />
        <StatCard
          label="Calories"
          value={`${calBurned}`}
          colors={colors}
        />
        <StatCard
          label="Goal"
          value={user.steps.goal.toLocaleString()}
          colors={colors}
        />
      </View>

      {user.isWheelchairMode && (
        <View style={[styles.modeBanner, { backgroundColor: colors.secondary }]}>
          <Text
            style={[
              styles.modeBannerText,
              { color: colors.secondaryForeground, fontFamily: "Inter_500Medium" },
            ]}
          >
            ♿ Wheelchair mode active — push multiplier applied
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
          ]}
        >
          Add Steps
        </Text>
        <Text
          style={[
            styles.sectionSubtitle,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
        >
          Simulate activity or log manual steps
        </Text>
        <View style={styles.addStepsRow}>
          {[100, 500, 1000, 2000].map((amount) => (
            <Pressable
              key={amount}
              onPress={() => handleAddSteps(amount)}
              style={({ pressed }) => [
                styles.addBtn,
                {
                  backgroundColor: pressed ? colors.primary : colors.accent,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.addBtnText,
                  {
                    color: colors.primary,
                    fontFamily: "Inter_600SemiBold",
                  },
                ]}
              >
                +{amount}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View
        style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
          ]}
        >
          This Week
        </Text>
        <View style={styles.weekRow}>
          {user.steps.weekly.map((steps, index) => {
            const isToday = index === user.steps.weekly.length - 1;
            const metGoal = steps >= user.steps.goal;
            return (
              <View key={index} style={styles.dayCell}>
                <Text
                  style={[
                    styles.dayCellSteps,
                    {
                      color: metGoal ? colors.primary : colors.mutedForeground,
                      fontFamily: "Inter_600SemiBold",
                    },
                  ]}
                >
                  {steps >= 1000 ? `${(steps / 1000).toFixed(1)}k` : steps}
                </Text>
                <View
                  style={[
                    styles.dayCellDot,
                    {
                      backgroundColor: metGoal
                        ? colors.primary
                        : steps > 0
                        ? colors.muted
                        : colors.border,
                      borderWidth: isToday ? 2 : 0,
                      borderColor: colors.primary,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.dayCellLabel,
                    {
                      color: isToday
                        ? colors.primary
                        : colors.mutedForeground,
                      fontFamily: isToday
                        ? "Inter_600SemiBold"
                        : "Inter_400Regular",
                    },
                  ]}
                >
                  {DAYS[index].slice(0, 1)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

function StatCard({
  label,
  value,
  colors,
  accent,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  accent?: boolean;
}) {
  return (
    <View
      style={[
        statStyles.card,
        { backgroundColor: accent ? colors.accent : colors.card, borderColor: colors.border },
      ]}
    >
      <Text
        style={[
          statStyles.value,
          {
            color: accent ? colors.primary : colors.foreground,
            fontFamily: "Inter_700Bold",
          },
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          statStyles.label,
          { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    gap: 2,
  },
  value: {
    fontSize: 18,
  },
  label: {
    fontSize: 11,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: {
    fontSize: 14,
  },
  title: {
    fontSize: 26,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  streakFire: {
    fontSize: 16,
  },
  streakCount: {
    fontSize: 18,
  },
  streakLabel: {
    fontSize: 12,
  },
  ringContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  modeBanner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modeBannerText: {
    fontSize: 13,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: -6,
  },
  addStepsRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  addBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    alignItems: "center",
  },
  addBtnText: {
    fontSize: 15,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  dayCell: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  dayCellSteps: {
    fontSize: 11,
  },
  dayCellDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dayCellLabel: {
    fontSize: 12,
  },
});

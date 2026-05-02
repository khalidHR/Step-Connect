import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FriendsStrip } from "@/components/FriendsStrip";
import { StepRing } from "@/components/StepRing";
import { WeeklyChart } from "@/components/WeeklyChart";
import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, friends, healthStatus, refreshHealthData } = useUser();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : 100;

  const kmWalked = ((user.steps.today * 0.762) / 1000).toFixed(2);
  const calBurned = Math.round(user.steps.today * 0.04);
  const isLoading = healthStatus === "checking";

  const handleRefresh = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refreshHealthData();
  };

  const today = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dateStr = `${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}`;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={[colors.primary + "18", colors.background]}
        style={[styles.headerGradient, { paddingTop: topPad + 12 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.dateLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {dateStr}
            </Text>
            <Text style={[styles.appName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              StepConnect
            </Text>
          </View>
          <View style={styles.headerRight}>
            {user.steps.streak > 0 && (
              <View style={[styles.streakPill, { backgroundColor: colors.accent }]}>
                <Text style={styles.streakFire}>🔥</Text>
                <Text style={[styles.streakNum, { color: colors.accentForeground, fontFamily: "Inter_700Bold" }]}>
                  {user.steps.streak}
                </Text>
                <Text style={[styles.streakDay, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  days
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Status banner */}
        {(healthStatus === "web" || healthStatus === "denied" || healthStatus === "unavailable") && (
          <Pressable
            onPress={handleRefresh}
            style={[styles.statusBanner, { backgroundColor: healthStatus === "denied" ? "#fef3c7" : colors.muted }]}
          >
            <Text style={[styles.statusText, { color: healthStatus === "denied" ? "#92400e" : colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {healthStatus === "web"
                ? "📱 Scan QR with Expo Go on iPhone for real step data"
                : healthStatus === "denied"
                ? "⚠️ Motion access denied — tap to retry"
                : "⚠️ Step tracking not available on this device"}
            </Text>
          </Pressable>
        )}

        {/* Step ring */}
        {isLoading ? (
          <View style={styles.loadingArea}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Connecting to Apple Health…
            </Text>
          </View>
        ) : (
          <View style={styles.ringArea}>
            <StepRing
              steps={user.steps.today}
              goal={user.steps.goal}
              size={248}
              strokeWidth={22}
            />
          </View>
        )}

        {/* Quick stats row */}
        <View style={styles.statsRow}>
          <StatChip icon="🚶" label="Distance" value={`${kmWalked} km`} colors={colors} />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <StatChip icon="🔥" label="Calories" value={`${calBurned}`} colors={colors} />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <StatChip icon="🎯" label="Goal" value={user.steps.goal >= 1000 ? `${(user.steps.goal / 1000).toFixed(0)}k` : `${user.steps.goal}`} colors={colors} />
        </View>
      </LinearGradient>

      {/* Friends leaderboard strip */}
      {friends.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Friends Today
            </Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {[...friends, { steps: { today: user.steps.today } }].sort((a, b) => b.steps.today - a.steps.today)[0] === friends[0]
                ? `${friends[0].name.split(" ")[0]} is leading`
                : "You're in the lead!"}
            </Text>
          </View>
          <FriendsStrip user={user} friends={friends} />
        </View>
      )}

      {/* Weekly activity chart */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 20 }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              This Week
            </Text>
            <Text style={[styles.cardSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {user.steps.weekly.reduce((s, n) => s + n, 0).toLocaleString()} total steps
            </Text>
          </View>
          <View style={[styles.weekBadge, { backgroundColor: user.steps.weekly.filter(s => s >= user.steps.goal).length >= 5 ? colors.accent : colors.muted }]}>
            <Text style={[styles.weekBadgeText, { color: user.steps.weekly.filter(s => s >= user.steps.goal).length >= 5 ? colors.primary : colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
              {user.steps.weekly.filter(s => s >= user.steps.goal).length} / 7 goals
            </Text>
          </View>
        </View>
        <WeeklyChart data={user.steps.weekly} goal={user.steps.goal} height={120} />
      </View>

      {/* Wheelchair mode notice */}
      {user.isWheelchairMode && (
        <View style={[styles.modeBanner, { backgroundColor: colors.secondary, marginHorizontal: 20 }]}>
          <Text style={[styles.modeBannerText, { color: colors.secondaryForeground, fontFamily: "Inter_500Medium" }]}>
            ♿ Wheelchair mode active — push multiplier applied
          </Text>
        </View>
      )}

      {/* Refresh button */}
      {healthStatus === "available" && (
        <Pressable
          onPress={handleRefresh}
          style={({ pressed }) => [
            styles.refreshBtn,
            { backgroundColor: pressed ? colors.muted : "transparent", marginHorizontal: 20, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[styles.refreshText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            ↻  Refresh from Apple Health
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

function StatChip({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View style={styles.statChip}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Header / ring zone */
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  headerRight: { alignItems: "flex-end" },
  dateLabel: { fontSize: 13 },
  appName: { fontSize: 26 },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 4,
  },
  streakFire: { fontSize: 15 },
  streakNum: { fontSize: 18 },
  streakDay: { fontSize: 12 },

  statusBanner: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 4,
  },
  statusText: { fontSize: 13, lineHeight: 18 },

  ringArea: {
    alignItems: "center",
    paddingVertical: 12,
  },
  loadingArea: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 14,
  },
  loadingText: { fontSize: 14 },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 4,
  },
  statChip: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  statIcon: { fontSize: 18 },
  statValue: { fontSize: 17 },
  statLabel: { fontSize: 11 },
  statDivider: {
    width: 1,
    height: 36,
  },

  /* Friends strip */
  section: {
    marginTop: 20,
    gap: 12,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    gap: 2,
  },
  sectionTitle: { fontSize: 17 },
  sectionSub: { fontSize: 13 },

  /* Weekly chart card */
  card: {
    marginTop: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: { fontSize: 16 },
  cardSub: { fontSize: 12, marginTop: 2 },
  weekBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  weekBadgeText: { fontSize: 12 },

  modeBanner: {
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modeBannerText: { fontSize: 13 },

  refreshBtn: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  refreshText: { fontSize: 13 },
});

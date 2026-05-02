import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FriendsStrip } from "@/components/FriendsStrip";
import { StepRing } from "@/components/StepRing";
import { WeeklyChart } from "@/components/WeeklyChart";
import { useI18n } from "@/context/I18nContext";
import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width: winW, height: winH } = useWindowDimensions();
  const { user, friends, healthStatus, refreshHealthData } = useUser();
  const { t, isRTL } = useI18n();

  const topPad = Platform.OS === "web" ? 24 : insets.top;
  const bottomPad = Platform.OS === "web" ? 16 : insets.bottom + 8;

  const ringSize = Math.min(Math.floor(winH * 0.28), 210);
  const chartH = Math.min(Math.floor(winH * 0.13), 100);
  const isLoading = healthStatus === "checking";

  const kmWalked = ((user.steps.today * 0.762) / 1000).toFixed(2);
  const calBurned = Math.round(user.steps.today * 0.04);

  const today = new Date();
  const dayNames = isRTL
    ? ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"]
    : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const monthNames = isRTL
    ? ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"]
    : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dateStr = `${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}`;

  const goalsHit = user.steps.weekly.filter((s) => s >= user.steps.goal).length;
  const totalWeekly = user.steps.weekly.reduce((s, n) => s + n, 0);

  const topFriend = [...friends].sort((a, b) => b.steps.today - a.steps.today)[0];
  const userLeads = !topFriend || user.steps.today >= topFriend.steps.today;
  const leadLabel = userLeads
    ? t("youLead")
    : t("isLeading", { name: topFriend.name.split(" ")[0] });

  const goTo = async (route: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>

      {/* ── Header ── */}
      <LinearGradient
        colors={[colors.primary + "18", colors.background]}
        style={[styles.header, { paddingTop: topPad + 10 }]}
      >
        <View style={[styles.headerRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View>
            <Text style={[styles.dateLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {dateStr}
            </Text>
            <Text style={[styles.appName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {t("appName")}
            </Text>
          </View>
          <View style={[styles.headerActions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            {user.steps.streak > 0 && (
              <View style={[styles.streakPill, { backgroundColor: colors.accent }]}>
                <Text style={styles.streakFire}>🔥</Text>
                <Text style={[styles.streakNum, { color: colors.accentForeground, fontFamily: "Inter_700Bold" }]}>
                  {user.steps.streak}
                </Text>
              </View>
            )}
            <Pressable
              onPress={() => goTo("/navigation")}
              hitSlop={8}
              style={({ pressed }) => [styles.iconBtn, { backgroundColor: pressed ? colors.muted : colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
            >
              <Feather name="grid" size={18} color={colors.foreground} />
            </Pressable>
            <Pressable
              onPress={() => goTo("/settings")}
              hitSlop={8}
              style={({ pressed }) => [styles.iconBtn, { backgroundColor: pressed ? colors.muted : colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
            >
              <Feather name="settings" size={18} color={colors.foreground} />
            </Pressable>
          </View>
        </View>

        {/* Only show banner for denied — not for web */}
        {healthStatus === "denied" && (
          <Pressable
            onPress={refreshHealthData}
            style={[styles.banner, { backgroundColor: "#fef3c7" }]}
          >
            <Text style={[styles.bannerText, { color: "#92400e", fontFamily: "Inter_400Regular" }]}>
              ⚠️ {t("motionDenied")}
            </Text>
          </Pressable>
        )}
      </LinearGradient>

      {/* ── Step Ring (fills remaining space) ── */}
      <View style={styles.ringZone}>
        {isLoading ? (
          <View style={styles.loadingArea}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <StepRing steps={user.steps.today} goal={user.steps.goal} size={ringSize} strokeWidth={Math.round(ringSize * 0.088)} />
        )}
      </View>

      {/* ── Stats row ── */}
      <View style={[styles.statsRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <StatChip icon="🚶" label={t("distance")} value={`${kmWalked} km`} colors={colors} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <StatChip icon="🔥" label={t("calories")} value={`${calBurned}`} colors={colors} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <StatChip icon="🎯" label={t("goal")} value={user.steps.goal >= 1000 ? `${(user.steps.goal / 1000).toFixed(0)}k` : `${user.steps.goal}`} colors={colors} />
      </View>

      {/* ── Separator ── */}
      <View style={[styles.sep, { backgroundColor: colors.border }]} />

      {/* ── Friends strip ── */}
      {friends.length > 0 && (
        <View style={styles.friendsSection}>
          <View style={[styles.friendsHeader, { flexDirection: isRTL ? "row-reverse" : "row", paddingHorizontal: 20 }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              {t("friendsToday")}
            </Text>
            <Text style={[styles.sectionSub, { color: userLeads ? colors.primary : colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              {leadLabel}
            </Text>
          </View>
          <FriendsStrip user={user} friends={friends} />
        </View>
      )}

      {/* ── Weekly chart ── */}
      <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 16 }]}>
        <View style={[styles.chartHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Text style={[styles.chartTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {t("thisWeek")}
          </Text>
          <View style={[styles.goalsChip, { backgroundColor: goalsHit >= 5 ? colors.accent : colors.muted }]}>
            <Text style={[styles.goalsChipText, { color: goalsHit >= 5 ? colors.primary : colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
              {goalsHit}/7 {t("goalsHit")}
            </Text>
          </View>
        </View>
        <WeeklyChart data={user.steps.weekly} goal={user.steps.goal} height={chartH} />
      </View>

      <View style={{ height: bottomPad }} />
    </View>
  );
}

function StatChip({ icon, label, value, colors }: {
  icon: string; label: string; value: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View style={styles.statChip}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, gap: 8 },
  headerRow: { alignItems: "center", justifyContent: "space-between" },
  headerActions: { alignItems: "center", gap: 8 },
  dateLabel: { fontSize: 12 },
  appName: { fontSize: 24, letterSpacing: -0.3 },
  streakPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, gap: 4 },
  streakFire: { fontSize: 13 },
  streakNum: { fontSize: 15 },
  iconBtn: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  banner: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  bannerText: { fontSize: 12, lineHeight: 17 },
  ringZone: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingArea: { alignItems: "center", justifyContent: "center" },
  statsRow: { alignItems: "center", justifyContent: "space-around", paddingVertical: 10, paddingHorizontal: 16 },
  statChip: { flex: 1, alignItems: "center", gap: 2 },
  statIcon: { fontSize: 16 },
  statValue: { fontSize: 15 },
  statLabel: { fontSize: 10 },
  divider: { width: 1, height: 32 },
  sep: { height: 1, marginHorizontal: 20, marginBottom: 10 },
  friendsSection: { gap: 8, marginBottom: 12 },
  friendsHeader: { alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 15 },
  sectionSub: { fontSize: 12 },
  chartCard: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, gap: 8 },
  chartHeader: { alignItems: "center", justifyContent: "space-between" },
  chartTitle: { fontSize: 14 },
  goalsChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  goalsChipText: { fontSize: 11 },
});

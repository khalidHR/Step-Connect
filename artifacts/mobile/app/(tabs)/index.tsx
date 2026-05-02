import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
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
import { useI18n } from "@/context/I18nContext";
import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, friends, healthStatus, refreshHealthData } = useUser();
  const { t, isRTL } = useI18n();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

  const kmWalked = ((user.steps.today * 0.762) / 1000).toFixed(2);
  const calBurned = Math.round(user.steps.today * 0.04);
  const isLoading = healthStatus === "checking";

  const handleRefresh = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refreshHealthData();
  };

  const goTo = async (route: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const today = new Date();
  const dayNames = isRTL
    ? ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"]
    : ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const monthNames = isRTL
    ? ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"]
    : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dateStr = isRTL
    ? `${today.getDate()} ${monthNames[today.getMonth()]}`
    : `${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}`;

  const totalWeekly = user.steps.weekly.reduce((s, n) => s + n, 0);
  const goalsHit = user.steps.weekly.filter((s) => s >= user.steps.goal).length;

  const topFriend = [...friends].sort((a, b) => b.steps.today - a.steps.today)[0];
  const userLeads = !topFriend || user.steps.today >= topFriend.steps.today;
  const leadLabel = userLeads
    ? t("youLead")
    : t("isLeading", { name: topFriend.name.split(" ")[0] });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
      >
        <LinearGradient
          colors={[colors.primary + "20", colors.background]}
          style={[styles.hero, { paddingTop: topPad + 12 }]}
        >
          {/* Header row */}
          <View style={[styles.headerRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View>
              <Text style={[styles.dateLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: isRTL ? "right" : "left" }]}>
                {dateStr}
              </Text>
              <Text style={[styles.appName, { color: colors.foreground, fontFamily: "Inter_700Bold", textAlign: isRTL ? "right" : "left" }]}>
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
                onPress={() => goTo("/settings")}
                style={({ pressed }) => [
                  styles.settingsBtn,
                  { backgroundColor: pressed ? colors.muted : colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                ]}
                hitSlop={8}
              >
                <Text style={styles.settingsIcon}>⚙️</Text>
              </Pressable>
            </View>
          </View>

          {/* Health banner */}
          {(healthStatus === "web" || healthStatus === "denied" || healthStatus === "unavailable") && (
            <Pressable
              onPress={handleRefresh}
              style={[styles.banner, { backgroundColor: healthStatus === "denied" ? "#fef3c7" : colors.muted }]}
            >
              <Text style={[styles.bannerText, { color: healthStatus === "denied" ? "#92400e" : colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: isRTL ? "right" : "left" }]}>
                {healthStatus === "web" ? `📱 ${t("scanQRPhone")}` : `⚠️ ${t("motionDenied")}`}
              </Text>
            </Pressable>
          )}

          {/* Ring */}
          {isLoading ? (
            <View style={styles.loadingArea}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Connecting to Apple Health…
              </Text>
            </View>
          ) : (
            <View style={styles.ringArea}>
              <StepRing steps={user.steps.today} goal={user.steps.goal} size={248} strokeWidth={22} />
            </View>
          )}

          {/* Stats row */}
          <View style={[styles.statsRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <StatChip icon="🚶" label={t("distance")} value={`${kmWalked} km`} colors={colors} isRTL={isRTL} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <StatChip icon="🔥" label={t("calories")} value={`${calBurned}`} colors={colors} isRTL={isRTL} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <StatChip icon="🎯" label={t("goal")} value={user.steps.goal >= 1000 ? `${(user.steps.goal / 1000).toFixed(0)}k` : `${user.steps.goal}`} colors={colors} isRTL={isRTL} />
          </View>
        </LinearGradient>

        {/* Quick nav row */}
        <View style={[styles.navRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          {[
            { icon: "🏆", label: t("leaderboard"), route: "/leaderboard", color: "#f59e0b" },
            { icon: "👥", label: t("friends"), route: "/friends", color: colors.primary },
            { icon: "📊", label: t("reports"), route: "/reports", color: "#6366f1" },
          ].map((item) => (
            <Pressable
              key={item.route}
              onPress={() => goTo(item.route)}
              style={({ pressed }) => [
                styles.navCard,
                { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] },
              ]}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={[styles.navLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold", textAlign: "center" }]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Friends strip */}
        {friends.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold", textAlign: isRTL ? "right" : "left" }]}>
                {t("friendsToday")}
              </Text>
              <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {leadLabel}
              </Text>
            </View>
            <FriendsStrip user={user} friends={friends} />
          </View>
        )}

        {/* Weekly chart card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 20, marginTop: 16 }]}>
          <View style={[styles.cardHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold", textAlign: isRTL ? "right" : "left" }]}>
                {t("thisWeek")}
              </Text>
              <Text style={[styles.cardSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {totalWeekly.toLocaleString()} {t("totalSteps")}
              </Text>
            </View>
            <View style={[styles.goalsChip, { backgroundColor: goalsHit >= 5 ? colors.accent : colors.muted }]}>
              <Text style={[styles.goalsChipText, { color: goalsHit >= 5 ? colors.primary : colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                {goalsHit} / 7 {t("goalsHit")}
              </Text>
            </View>
          </View>
          <WeeklyChart data={user.steps.weekly} goal={user.steps.goal} height={110} />
        </View>

        {/* Wheelchair mode notice */}
        {user.isWheelchairMode && (
          <View style={[styles.modeBanner, { backgroundColor: colors.secondary, marginHorizontal: 20, marginTop: 12 }]}>
            <Text style={[styles.modeBannerText, { color: colors.secondaryForeground, fontFamily: "Inter_500Medium", textAlign: isRTL ? "right" : "left" }]}>
              ♿ {t("wheelchairActive")}
            </Text>
          </View>
        )}

        {healthStatus === "available" && (
          <Pressable
            onPress={handleRefresh}
            style={({ pressed }) => [
              styles.refreshBtn,
              { marginHorizontal: 20, marginTop: 12, borderColor: colors.border, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text style={[styles.refreshText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              ↻  {t("refreshHealth")}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

function StatChip({ icon, label, value, colors, isRTL }: {
  icon: string; label: string; value: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  isRTL: boolean;
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
  hero: { paddingHorizontal: 20, paddingBottom: 20, gap: 8 },
  headerRow: { alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  headerActions: { alignItems: "center", gap: 10 },
  dateLabel: { fontSize: 13 },
  appName: { fontSize: 26 },
  streakPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 4 },
  streakFire: { fontSize: 14 },
  streakNum: { fontSize: 16 },
  settingsBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  settingsIcon: { fontSize: 18 },
  banner: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  bannerText: { fontSize: 13, lineHeight: 18 },
  ringArea: { alignItems: "center", paddingVertical: 6 },
  loadingArea: { alignItems: "center", paddingVertical: 60, gap: 14 },
  loadingText: { fontSize: 14 },
  statsRow: { alignItems: "center", justifyContent: "space-around", marginTop: 4 },
  statChip: { flex: 1, alignItems: "center", gap: 3 },
  statIcon: { fontSize: 18 },
  statValue: { fontSize: 16 },
  statLabel: { fontSize: 11 },
  divider: { width: 1, height: 36 },
  navRow: { flexDirection: "row", paddingHorizontal: 20, gap: 10, marginTop: 20 },
  navCard: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 16, borderWidth: 1, gap: 6, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 12 },
  section: { marginTop: 20, gap: 12 },
  sectionHeader: { paddingHorizontal: 20, alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 17 },
  sectionSub: { fontSize: 13 },
  card: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  cardHeader: { alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontSize: 16 },
  cardSub: { fontSize: 12, marginTop: 2 },
  goalsChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  goalsChipText: { fontSize: 12 },
  modeBanner: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  modeBannerText: { fontSize: 13 },
  refreshBtn: { alignItems: "center", paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  refreshText: { fontSize: 13 },
});

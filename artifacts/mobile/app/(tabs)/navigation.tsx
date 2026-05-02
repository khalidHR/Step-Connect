import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useI18n } from "@/context/I18nContext";
import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

const NAV_ITEMS = [
  {
    key: "leaderboard" as const,
    icon: "award" as const,
    emoji: "🏆",
    route: "/leaderboard",
    gradient: ["#f59e0b22", "#fef3c7"],
    iconColor: "#f59e0b",
    accentColor: "#f59e0b",
  },
  {
    key: "friends" as const,
    icon: "users" as const,
    emoji: "👥",
    route: "/friends",
    gradient: ["#16a34a22", "#dcfce7"],
    iconColor: "#16a34a",
    accentColor: "#16a34a",
  },
  {
    key: "reports" as const,
    icon: "bar-chart-2" as const,
    emoji: "📊",
    route: "/reports",
    gradient: ["#6366f122", "#ede9fe"],
    iconColor: "#6366f1",
    accentColor: "#6366f1",
  },
];

export default function NavigationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useI18n();
  const { user, friends } = useUser();

  const topPad = Platform.OS === "web" ? 24 : insets.top;
  const bottomPad = Platform.OS === "web" ? 24 : insets.bottom + 20;

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleNav = async (route: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(route as any);
  };

  const stats = [
    { label: isRTL ? "الخطوات اليوم" : "Today's Steps", value: user.steps.today.toLocaleString() },
    { label: isRTL ? "الأصدقاء" : "Friends", value: friends.length.toString() },
    { label: isRTL ? "أيام متواصلة" : "Streak", value: `${user.steps.streak} ${isRTL ? "يوم" : "days"}` },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
          hitSlop={10}
        >
          <Feather name={isRTL ? "chevron-right" : "chevron-left"} size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          {isRTL ? "القائمة" : "Explore"}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Profile hero card */}
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 20 }]}>
        {/* Avatar + name row */}
        <View style={styles.profileTop}>
          <LinearGradient
            colors={[user.color + "33", user.color + "11"]}
            style={[styles.avatarRing, { borderColor: user.color + "55" }]}
          >
            <View style={[styles.avatar, { backgroundColor: user.color }]}>
              <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>{user.initials}</Text>
            </View>
          </LinearGradient>
          <View style={styles.profileMeta}>
            <Text style={[styles.profileName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {user.name}
            </Text>
            <View style={[styles.activeBadge, { backgroundColor: colors.accent }]}>
              <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.activeText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                {isRTL ? "نشط اليوم" : "Active today"}
              </Text>
            </View>
          </View>
        </View>

        {/* Stat tiles */}
        <View style={styles.statGrid}>
          {[
            { emoji: "👣", value: user.steps.today.toLocaleString(), label: isRTL ? "خطوات اليوم" : "Today's Steps", bg: colors.primary + "15", val: colors.primary },
            { emoji: "👥", value: friends.length.toString(), label: isRTL ? "الأصدقاء" : "Friends", bg: "#6366f115", val: "#6366f1" },
            { emoji: "🔥", value: user.steps.streak > 0 ? `${user.steps.streak}d` : "—", label: isRTL ? "الأيام المتواصلة" : "Streak", bg: "#f59e0b15", val: "#f59e0b" },
          ].map((s, i) => (
            <View key={i} style={[styles.statTile, { backgroundColor: s.bg }]}>
              <Text style={styles.tileEmoji}>{s.emoji}</Text>
              <Text style={[styles.tileVal, { color: s.val, fontFamily: "Inter_700Bold" }]}>{s.value}</Text>
              <Text style={[styles.tileLbl, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Navigation cards */}
      <View style={styles.navList}>
        {NAV_ITEMS.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => handleNav(item.route)}
            style={({ pressed }) => [
              styles.navCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <LinearGradient
              colors={item.gradient as [string, string]}
              style={styles.navIconBox}
            >
              <Text style={styles.navEmoji}>{item.emoji}</Text>
            </LinearGradient>
            <View style={styles.navInfo}>
              <Text style={[styles.navTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                {t(item.key as any)}
              </Text>
              <Text style={[styles.navSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {item.key === "leaderboard" && (isRTL ? "شاهد ترتيب الخطوات" : "See daily step rankings")}
                {item.key === "friends" && (isRTL ? `${friends.length} صديق متصل` : `${friends.length} connected`)}
                {item.key === "reports" && (isRTL ? "تقارير أسبوعية وشهرية" : "Weekly & monthly stats")}
              </Text>
            </View>
            <Feather
              name={isRTL ? "chevron-left" : "chevron-right"}
              size={18}
              color={colors.mutedForeground}
            />
          </Pressable>
        ))}
      </View>

      <View style={{ height: bottomPad }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20 },
  profileCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 20 },
  profileMeta: { flex: 1, gap: 6 },
  profileName: { fontSize: 20 },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  activeDot: { width: 6, height: 6, borderRadius: 3 },
  activeText: { fontSize: 12 },
  statGrid: {
    flexDirection: "row",
    gap: 10,
  },
  statTile: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 5,
  },
  tileEmoji: { fontSize: 20 },
  tileVal: { fontSize: 17 },
  tileLbl: { fontSize: 10, textAlign: "center" },
  navList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  navCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  navIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  navEmoji: { fontSize: 24 },
  navInfo: { flex: 1, gap: 3 },
  navTitle: { fontSize: 17 },
  navSub: { fontSize: 13 },
});

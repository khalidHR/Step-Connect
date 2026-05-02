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

      {/* Profile snapshot */}
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 20 }]}>
        <View style={[styles.avatar, { backgroundColor: user.color }]}>
          <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>{user.initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {user.name}
          </Text>
          <View style={styles.statsRow}>
            {stats.map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={[styles.statVal, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{s.value}</Text>
                <Text style={[styles.statLbl, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{s.label}</Text>
              </View>
            ))}
          </View>
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
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: { color: "#fff", fontSize: 20 },
  profileInfo: { flex: 1, gap: 8 },
  profileName: { fontSize: 18 },
  statsRow: { flexDirection: "row", gap: 16 },
  statItem: { alignItems: "center", gap: 1 },
  statVal: { fontSize: 15 },
  statLbl: { fontSize: 10 },
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

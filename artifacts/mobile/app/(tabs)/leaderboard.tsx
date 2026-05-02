import { router } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LeaderboardCard } from "@/components/LeaderboardCard";
import { useI18n } from "@/context/I18nContext";
import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

interface RankedEntry {
  id: string; name: string; initials: string; color: string;
  steps: number; streak: number; isMe?: boolean;
}
const PODIUM_COLORS = ["#f59e0b", "#94a3b8", "#cd7c32"];

export default function LeaderboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, friends } = useUser();
  const { t, isRTL } = useI18n();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 24;

  const ranked = useMemo<RankedEntry[]>(() => {
    const all: RankedEntry[] = [
      { id: user.id, name: user.name, initials: user.initials, color: user.color, steps: user.steps.today, streak: user.steps.streak, isMe: true },
      ...friends.map((f) => ({ id: f.id, name: f.name, initials: f.initials, color: f.color, steps: f.steps.today, streak: f.steps.streak })),
    ];
    return all.sort((a, b) => b.steps - a.steps);
  }, [user, friends]);

  const userRank = ranked.findIndex((e) => e.isMe) + 1;
  const top3 = ranked.slice(0, 3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={ranked}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        renderItem={({ item, index }) => (
          <View style={styles.cardWrap}>
            <LeaderboardCard entry={item} rank={index + 1} />
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={[styles.header, { paddingTop: topPad + 16 }]}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]} hitSlop={12}>
              <Text style={[styles.backIcon, { color: colors.foreground }]}>{isRTL ? "→" : "←"}</Text>
              <Text style={[styles.backLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{t("settings")}</Text>
            </Pressable>

            <View style={[styles.titleRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <View>
                <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold", textAlign: isRTL ? "right" : "left" }]}>
                  {t("leaderboard")}
                </Text>
                <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: isRTL ? "right" : "left" }]}>
                  {t("todayRankings")}
                </Text>
              </View>
              <View style={[styles.rankBadge, { backgroundColor: colors.accent }]}>
                <Text style={[styles.rankNum, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>#{userRank}</Text>
                <Text style={[styles.rankLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{t("yourRank")}</Text>
              </View>
            </View>

            {top3.length >= 3 && (
              <View style={[styles.podium, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {podiumOrder.map((entry, podiumIdx) => {
                  const actualRank = ranked.findIndex((r) => r.id === entry.id) + 1;
                  const isCenter = podiumIdx === 1;
                  return (
                    <View key={entry.id} style={styles.podiumSlot}>
                      <View style={[styles.podiumAvatar, { backgroundColor: entry.color, width: isCenter ? 58 : 46, height: isCenter ? 58 : 46, borderRadius: isCenter ? 29 : 23 }]}>
                        <Text style={[styles.podiumInitials, { fontFamily: "Inter_700Bold", fontSize: isCenter ? 18 : 14 }]}>{entry.initials}</Text>
                      </View>
                      <Text style={[styles.podiumName, { color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: isCenter ? 14 : 12 }]} numberOfLines={1}>
                        {entry.name.split(" ")[0]}
                      </Text>
                      <Text style={[styles.podiumSteps, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {(entry.steps / 1000).toFixed(1)}k
                      </Text>
                      <View style={[styles.podiumBlock, { height: isCenter ? 80 : 56, backgroundColor: PODIUM_COLORS[actualRank - 1] + "25" }]}>
                        <Text style={[styles.podiumMedal, { color: PODIUM_COLORS[actualRank - 1] }]}>
                          {actualRank === 1 ? "🥇" : actualRank === 2 ? "🥈" : "🥉"}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <Text style={[styles.listTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold", textAlign: isRTL ? "right" : "left" }]}>
              {t("fullRankings")}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  cardWrap: { paddingHorizontal: 20 },
  header: { paddingHorizontal: 20, paddingBottom: 8, gap: 16 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  backIcon: { fontSize: 20 },
  backLabel: { fontSize: 15 },
  titleRow: { alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 26 },
  subtitle: { fontSize: 14, marginTop: 2 },
  rankBadge: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, alignItems: "center" },
  rankNum: { fontSize: 22 },
  rankLabel: { fontSize: 11 },
  podium: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", borderRadius: 20, borderWidth: 1, paddingTop: 20, overflow: "hidden", gap: 8 },
  podiumSlot: { flex: 1, alignItems: "center", gap: 4 },
  podiumAvatar: { alignItems: "center", justifyContent: "center" },
  podiumInitials: { color: "#fff" },
  podiumName: {},
  podiumSteps: { fontSize: 11 },
  podiumBlock: { width: "100%", alignItems: "center", justifyContent: "center", marginTop: 8 },
  podiumMedal: { fontSize: 24, paddingVertical: 12 },
  listTitle: { fontSize: 16, marginTop: 4 },
});

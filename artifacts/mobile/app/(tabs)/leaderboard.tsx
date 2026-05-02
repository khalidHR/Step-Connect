import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LeaderboardCard } from "@/components/LeaderboardCard";
import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

interface RankedEntry {
  id: string;
  name: string;
  initials: string;
  color: string;
  steps: number;
  streak: number;
  isMe?: boolean;
}

const PODIUM_COLORS = ["#f59e0b", "#94a3b8", "#cd7c32"];

export default function LeaderboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, friends } = useUser();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : 100;

  const ranked = useMemo<RankedEntry[]>(() => {
    const all: RankedEntry[] = [
      {
        id: user.id,
        name: user.name,
        initials: user.initials,
        color: user.color,
        steps: user.steps.today,
        streak: user.steps.streak,
        isMe: true,
      },
      ...friends.map((f) => ({
        id: f.id,
        name: f.name,
        initials: f.initials,
        color: f.color,
        steps: f.steps.today,
        streak: f.steps.streak,
      })),
    ];
    return all.sort((a, b) => b.steps - a.steps);
  }, [user, friends]);

  const userRank = ranked.findIndex((e) => e.isMe) + 1;
  const top3 = ranked.slice(0, 3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  const renderItem = ({ item, index }: { item: RankedEntry; index: number }) => (
    <LeaderboardCard entry={item} rank={index + 1} />
  );

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={ranked}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={ranked.length > 4}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          { paddingTop: topPad + 16, paddingBottom: bottomPad },
        ]}
        ListHeaderComponent={() => (
          <>
            <View style={styles.headerRow}>
              <View>
                <Text
                  style={[
                    styles.screenTitle,
                    { color: colors.foreground, fontFamily: "Inter_700Bold" },
                  ]}
                >
                  Leaderboard
                </Text>
                <Text
                  style={[
                    styles.screenSubtitle,
                    { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                  ]}
                >
                  Today's rankings
                </Text>
              </View>
              <View style={[styles.myRankBadge, { backgroundColor: colors.accent }]}>
                <Text
                  style={[
                    styles.myRankText,
                    { color: colors.primary, fontFamily: "Inter_700Bold" },
                  ]}
                >
                  #{userRank}
                </Text>
                <Text
                  style={[
                    styles.myRankLabel,
                    { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                  ]}
                >
                  your rank
                </Text>
              </View>
            </View>

            {top3.length >= 3 && (
              <View style={[styles.podium, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {podiumOrder.map((entry, podiumIdx) => {
                  const actualRank = ranked.findIndex((r) => r.id === entry.id) + 1;
                  const isCenter = podiumIdx === 1;
                  const podiumHeight = isCenter ? 80 : 56;

                  return (
                    <View key={entry.id} style={styles.podiumSlot}>
                      <View style={[styles.podiumAvatar, { backgroundColor: entry.color, width: isCenter ? 56 : 46, height: isCenter ? 56 : 46, borderRadius: isCenter ? 28 : 23 }]}>
                        <Text style={[styles.podiumAvatarText, { fontFamily: "Inter_700Bold", fontSize: isCenter ? 18 : 15 }]}>
                          {entry.initials}
                        </Text>
                      </View>
                      <Text style={[styles.podiumName, { color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: isCenter ? 14 : 12 }]}>
                        {entry.name.split(" ")[0]}
                      </Text>
                      <Text style={[styles.podiumSteps, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {(entry.steps / 1000).toFixed(1)}k
                      </Text>
                      <View style={[styles.podiumBlock, { height: podiumHeight, backgroundColor: PODIUM_COLORS[actualRank - 1] + "30" }]}>
                        <Text style={[styles.podiumMedal, { color: PODIUM_COLORS[actualRank - 1] }]}>
                          {actualRank === 1 ? "🥇" : actualRank === 2 ? "🥈" : "🥉"}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <Text
              style={[
                styles.listTitle,
                { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              Full Rankings
            </Text>
          </>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 20,
    gap: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 26,
  },
  screenSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  myRankBadge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
  },
  myRankText: {
    fontSize: 22,
  },
  myRankLabel: {
    fontSize: 11,
  },
  podium: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: 1,
    paddingTop: 20,
    paddingBottom: 0,
    marginBottom: 20,
    gap: 8,
    overflow: "hidden",
  },
  podiumSlot: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  podiumAvatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  podiumAvatarText: {
    color: "#fff",
  },
  podiumName: {},
  podiumSteps: {
    fontSize: 11,
  },
  podiumBlock: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  podiumMedal: {
    fontSize: 24,
    paddingVertical: 12,
  },
  listTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
});

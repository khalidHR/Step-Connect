import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface LeaderboardEntry {
  id: string;
  name: string;
  initials: string;
  color: string;
  steps: number;
  streak: number;
  isMe?: boolean;
}

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  rank: number;
}

const RANK_COLORS = ["#f59e0b", "#94a3b8", "#cd7c32"];
const RANK_LABELS = ["1st", "2nd", "3rd"];

export function LeaderboardCard({ entry, rank }: LeaderboardCardProps) {
  const colors = useColors();
  const isTop3 = rank <= 3;
  const rankColor = isTop3 ? RANK_COLORS[rank - 1] : colors.mutedForeground;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: entry.isMe ? colors.accent : colors.card,
          borderColor: entry.isMe ? colors.primary : colors.border,
          borderWidth: entry.isMe ? 1.5 : 1,
        },
      ]}
    >
      <View style={[styles.rankBadge, { backgroundColor: rankColor + "22" }]}>
        <Text
          style={[
            styles.rankText,
            { color: rankColor, fontFamily: "Inter_700Bold" },
          ]}
        >
          {isTop3 ? RANK_LABELS[rank - 1] : `#${rank}`}
        </Text>
      </View>

      <View style={[styles.avatar, { backgroundColor: entry.color }]}>
        <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>
          {entry.initials}
        </Text>
      </View>

      <View style={styles.info}>
        <Text
          style={[
            styles.name,
            {
              color: colors.foreground,
              fontFamily: "Inter_600SemiBold",
            },
          ]}
        >
          {entry.name}
          {entry.isMe ? " (you)" : ""}
        </Text>
        <View style={styles.streakRow}>
          <Text style={[styles.streakText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            🔥 {entry.streak} day streak
          </Text>
        </View>
      </View>

      <View style={styles.stepsContainer}>
        <Text
          style={[
            styles.steps,
            {
              color: entry.isMe ? colors.primary : colors.foreground,
              fontFamily: "Inter_700Bold",
            },
          ]}
        >
          {entry.steps.toLocaleString()}
        </Text>
        <Text
          style={[
            styles.stepsLabel,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
        >
          steps
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 10,
    gap: 12,
  },
  rankBadge: {
    width: 40,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 15,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakText: {
    fontSize: 12,
  },
  stepsContainer: {
    alignItems: "flex-end",
    gap: 1,
  },
  steps: {
    fontSize: 18,
  },
  stepsLabel: {
    fontSize: 11,
  },
});

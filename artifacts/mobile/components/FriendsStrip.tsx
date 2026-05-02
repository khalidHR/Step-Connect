import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Friend, User } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

interface StripEntry {
  id: string;
  name: string;
  initials: string;
  color: string;
  steps: number;
  isMe?: boolean;
}

interface FriendsStripProps {
  user: User;
  friends: Friend[];
}

export function FriendsStrip({ user, friends }: FriendsStripProps) {
  const colors = useColors();

  const entries: StripEntry[] = [
    {
      id: "me",
      name: "You",
      initials: user.initials,
      color: user.color,
      steps: user.steps.today,
      isMe: true,
    },
    ...friends.map((f) => ({
      id: f.id,
      name: f.name.split(" ")[0],
      initials: f.initials,
      color: f.color,
      steps: f.steps.today,
    })),
  ].sort((a, b) => b.steps - a.steps);

  const leader = entries[0];
  const rest = entries.slice(1);

  const fmtSteps = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}
    >
      {/* Leader — elevated above the rest */}
      <View style={styles.leaderSlot}>
        <Text style={styles.crown}>👑</Text>
        <View
          style={[
            styles.leaderCircle,
            {
              backgroundColor: leader.color,
              borderWidth: leader.isMe ? 3 : 2.5,
              borderColor: leader.isMe ? colors.primary : "#f59e0b",
            },
          ]}
        >
          <Text style={[styles.leaderInitials, { fontFamily: "Inter_700Bold" }]}>
            {leader.initials}
          </Text>
        </View>
        <Text
          style={[styles.leaderName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}
          numberOfLines={1}
        >
          {leader.name}
        </Text>
        <Text style={[styles.leaderSteps, { color: "#f59e0b", fontFamily: "Inter_700Bold" }]}>
          {fmtSteps(leader.steps)}
        </Text>
      </View>

      {/* Spacer between leader and rest */}
      <View style={styles.gap} />

      {/* Vertical line separating leader from pack */}
      <View style={[styles.vertLine, { backgroundColor: colors.border }]} />

      <View style={styles.gap} />

      {/* Rest — all on the same baseline */}
      {rest.map((entry) => (
        <View key={entry.id} style={styles.restSlot}>
          <View
            style={[
              styles.restCircle,
              {
                backgroundColor: entry.color,
                borderWidth: entry.isMe ? 2.5 : 0,
                borderColor: entry.isMe ? colors.primary : "transparent",
              },
            ]}
          >
            <Text style={[styles.restInitials, { fontFamily: "Inter_700Bold" }]}>
              {entry.initials}
            </Text>
          </View>
          <Text
            style={[
              styles.restName,
              {
                color: entry.isMe ? colors.primary : colors.foreground,
                fontFamily: entry.isMe ? "Inter_600SemiBold" : "Inter_400Regular",
              },
            ]}
            numberOfLines={1}
          >
            {entry.name}
          </Text>
          <Text style={[styles.restSteps, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            {fmtSteps(entry.steps)}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: {
    paddingHorizontal: 20,
    alignItems: "flex-end",
    paddingBottom: 4,
  },
  leaderSlot: {
    alignItems: "center",
    gap: 4,
  },
  crown: {
    fontSize: 16,
    lineHeight: 20,
  },
  leaderCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: "center",
    justifyContent: "center",
  },
  leaderInitials: {
    color: "#fff",
    fontSize: 24,
  },
  leaderName: {
    fontSize: 13,
    maxWidth: 80,
    textAlign: "center",
  },
  leaderSteps: {
    fontSize: 15,
  },
  gap: {
    width: 16,
  },
  vertLine: {
    width: 1,
    height: 52,
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  restSlot: {
    alignItems: "center",
    gap: 5,
    marginLeft: 14,
    marginBottom: 4,
  },
  restCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  restInitials: {
    color: "#fff",
    fontSize: 17,
  },
  restName: {
    fontSize: 11,
    maxWidth: 58,
    textAlign: "center",
  },
  restSteps: {
    fontSize: 12,
  },
});

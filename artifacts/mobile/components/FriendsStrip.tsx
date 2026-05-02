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

  const leaderId = entries[0]?.id;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}
    >
      {entries.map((entry) => {
        const isLeader = entry.id === leaderId;
        return (
          <View key={entry.id} style={styles.avatar}>
            {isLeader && (
              <Text style={styles.crown}>👑</Text>
            )}
            <View
              style={[
                styles.circle,
                {
                  backgroundColor: entry.color,
                  borderWidth: entry.isMe ? 2.5 : isLeader ? 2.5 : 0,
                  borderColor: entry.isMe
                    ? colors.primary
                    : isLeader
                    ? "#f59e0b"
                    : "transparent",
                },
              ]}
            >
              <Text style={[styles.initials, { fontFamily: "Inter_700Bold" }]}>
                {entry.initials}
              </Text>
            </View>
            <Text
              style={[
                styles.name,
                {
                  color: entry.isMe ? colors.primary : colors.foreground,
                  fontFamily: entry.isMe ? "Inter_600SemiBold" : "Inter_400Regular",
                },
              ]}
              numberOfLines={1}
            >
              {entry.name}
            </Text>
            <Text
              style={[
                styles.steps,
                {
                  color: isLeader ? "#f59e0b" : colors.mutedForeground,
                  fontFamily: isLeader ? "Inter_700Bold" : "Inter_500Medium",
                },
              ]}
            >
              {entry.steps >= 1000
                ? `${(entry.steps / 1000).toFixed(1)}k`
                : entry.steps.toString()}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: {
    paddingHorizontal: 20,
    gap: 18,
    paddingBottom: 4,
  },
  avatar: {
    alignItems: "center",
    gap: 5,
    width: 60,
  },
  crown: {
    fontSize: 14,
    lineHeight: 18,
  },
  circle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: "#fff",
    fontSize: 16,
  },
  name: {
    fontSize: 11,
    textAlign: "center",
  },
  steps: {
    fontSize: 12,
    textAlign: "center",
  },
});

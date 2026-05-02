import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Friend } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

interface FriendCardProps {
  friend: Friend;
  onRemove?: (id: string) => void;
  showAdd?: boolean;
  onAdd?: (friend: Friend) => void;
}

export function FriendCard({
  friend,
  onRemove,
  showAdd,
  onAdd,
}: FriendCardProps) {
  const colors = useColors();
  const progressPercent = Math.min(
    (friend.steps.today / friend.steps.goal) * 100,
    100,
  );
  const goalMet = friend.steps.today >= friend.steps.goal;

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (showAdd && onAdd) {
      onAdd(friend);
    } else if (onRemove) {
      onRemove(friend.id);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: friend.color }]}>
        <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>
          {friend.initials}
        </Text>
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text
            style={[
              styles.name,
              { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            {friend.name}
          </Text>
          {goalMet && (
            <View style={[styles.goalBadge, { backgroundColor: colors.accent }]}>
              <Text
                style={[
                  styles.goalBadgeText,
                  {
                    color: colors.accentForeground,
                    fontFamily: "Inter_600SemiBold",
                  },
                ]}
              >
                Goal!
              </Text>
            </View>
          )}
        </View>

        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressTrack,
              { backgroundColor: colors.muted },
            ]}
          >
            <View
              style={[
                styles.progressBar,
                {
                  backgroundColor: goalMet ? colors.primary : friend.color,
                  width: `${progressPercent}%`,
                },
              ]}
            />
          </View>
          <Text
            style={[
              styles.progressText,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            {friend.steps.today.toLocaleString()} / {friend.steps.goal.toLocaleString()}
          </Text>
        </View>

        <Text
          style={[
            styles.streak,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
        >
          🔥 {friend.steps.streak} day streak
        </Text>
      </View>

      {(showAdd || onRemove) && (
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            styles.actionBtn,
            {
              backgroundColor: showAdd ? colors.primary : colors.muted,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.actionBtnText,
              {
                color: showAdd ? colors.primaryForeground : colors.mutedForeground,
                fontFamily: "Inter_600SemiBold",
              },
            ]}
          >
            {showAdd ? "Add" : "Remove"}
          </Text>
        </Pressable>
      )}
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
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
  },
  info: {
    flex: 1,
    gap: 5,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 15,
  },
  goalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  goalBadgeText: {
    fontSize: 11,
  },
  progressContainer: {
    gap: 4,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
  },
  streak: {
    fontSize: 12,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    flexShrink: 0,
  },
  actionBtnText: {
    fontSize: 13,
  },
});

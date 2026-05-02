import * as Haptics from "expo-haptics";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, toggleWheelchairMode } = useUser();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : 100;

  const handleToggleWheelchair = async () => {
    await Haptics.selectionAsync();
    toggleWheelchairMode();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: bottomPad },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text
        style={[
          styles.title,
          { color: colors.foreground, fontFamily: "Inter_700Bold" },
        ]}
      >
        Settings
      </Text>

      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: user.color }]}>
          <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>
            {user.initials}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text
            style={[
              styles.profileName,
              { color: colors.foreground, fontFamily: "Inter_700Bold" },
            ]}
          >
            {user.name}
          </Text>
          <Text
            style={[
              styles.profileSub,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            Daily goal: {user.steps.goal.toLocaleString()} steps
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.mutedForeground, fontFamily: "Inter_500Medium" },
          ]}
        >
          ACCESSIBILITY
        </Text>

        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text
              style={[
                styles.rowLabel,
                { color: colors.foreground, fontFamily: "Inter_500Medium" },
              ]}
            >
              Wheelchair Mode
            </Text>
            <Text
              style={[
                styles.rowSub,
                { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
              ]}
            >
              Adjusts step calculations for wheelchair users
            </Text>
          </View>
          <Switch
            value={user.isWheelchairMode}
            onValueChange={handleToggleWheelchair}
            trackColor={{ false: colors.muted, true: colors.primary }}
            thumbColor={"#fff"}
          />
        </View>
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.mutedForeground, fontFamily: "Inter_500Medium" },
          ]}
        >
          ABOUT
        </Text>

        {[
          { label: "Version", value: "1.0.0 (PoC)" },
          { label: "Platform", value: Platform.OS },
          { label: "Tracking", value: "Simulated" },
        ].map((item, i) => (
          <View
            key={i}
            style={[
              styles.row,
              i < 2 && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.rowLabel,
                { color: colors.foreground, fontFamily: "Inter_500Medium" },
              ]}
            >
              {item.label}
            </Text>
            <Text
              style={[
                styles.rowValue,
                { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
              ]}
            >
              {item.value}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.infoBox,
          { backgroundColor: colors.accent, borderColor: colors.primary + "30" },
        ]}
      >
        <Text
          style={[
            styles.infoBoxTitle,
            { color: colors.accentForeground, fontFamily: "Inter_600SemiBold" },
          ]}
        >
          About StepConnect
        </Text>
        <Text
          style={[
            styles.infoBoxText,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
        >
          StepConnect transforms daily walking into a social, competitive fitness experience. Connect with friends, track your progress, and stay motivated through friendly competition.
        </Text>
        <Text
          style={[
            styles.infoBoxNote,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
        >
          This is a Proof of Concept with simulated step data. Full Apple Health integration available in production builds.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  title: {
    fontSize: 26,
    marginBottom: 4,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 22,
  },
  profileInfo: {
    gap: 4,
  },
  profileName: {
    fontSize: 20,
  },
  profileSub: {
    fontSize: 14,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 15,
  },
  rowSub: {
    fontSize: 12,
  },
  rowValue: {
    fontSize: 14,
  },
  infoBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 8,
  },
  infoBoxTitle: {
    fontSize: 15,
  },
  infoBoxText: {
    fontSize: 13,
    lineHeight: 20,
  },
  infoBoxNote: {
    fontSize: 11,
    lineHeight: 17,
    fontStyle: "italic",
  },
});

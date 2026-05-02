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

function healthStatusLabel(status: string) {
  switch (status) {
    case "available": return { label: "Connected", color: "#16a34a", icon: "✅" };
    case "checking": return { label: "Checking…", color: "#94a3b8", icon: "⏳" };
    case "denied": return { label: "Access denied", color: "#ef4444", icon: "❌" };
    case "unavailable": return { label: "Not available", color: "#f59e0b", icon: "⚠️" };
    case "web": return { label: "iOS only", color: "#94a3b8", icon: "📱" };
    default: return { label: "Unknown", color: "#94a3b8", icon: "?" };
  }
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, healthStatus, toggleWheelchairMode, refreshHealthData } = useUser();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : 100;
  const healthInfo = healthStatusLabel(healthStatus);

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
          <Text style={[styles.profileName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {user.name}
          </Text>
          <Text style={[styles.profileSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Daily goal: {user.steps.goal.toLocaleString()} steps
          </Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
          APPLE HEALTH
        </Text>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={[styles.rowIcon]}>{healthInfo.icon}</Text>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowTitle, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                Health Integration
              </Text>
              <Text style={[styles.rowSub, { color: healthInfo.color, fontFamily: "Inter_400Regular" }]}>
                {healthInfo.label}
              </Text>
            </View>
          </View>
          {healthStatus === "available" && (
            <Pressable
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                await refreshHealthData();
              }}
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: pressed ? colors.secondary : colors.muted, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[styles.actionBtnText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                Refresh
              </Text>
            </Pressable>
          )}
        </View>
        {healthStatus === "denied" && (
          <View style={[styles.permissionNote, { backgroundColor: "#fef3c7" }]}>
            <Text style={[styles.permissionNoteText, { color: "#92400e", fontFamily: "Inter_400Regular" }]}>
              Go to Settings → Privacy & Security → Motion & Fitness → enable StepConnect (or Expo Go)
            </Text>
          </View>
        )}
        {healthStatus === "web" && (
          <View style={[styles.permissionNote, { backgroundColor: colors.muted }]}>
            <Text style={[styles.permissionNoteText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Apple Health integration is only available when running on iPhone via Expo Go.
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
          ACCESSIBILITY
        </Text>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowIcon}>♿</Text>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowTitle, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                Wheelchair Mode
              </Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Applies a push multiplier to step counts
              </Text>
            </View>
          </View>
          <Switch
            value={user.isWheelchairMode}
            onValueChange={handleToggleWheelchair}
            trackColor={{ false: colors.muted, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
          ABOUT
        </Text>
        {[
          { label: "App", value: "StepConnect v1.0" },
          { label: "Platform", value: Platform.OS },
          { label: "Step Source", value: healthStatus === "available" ? "Apple Health" : "N/A" },
          { label: "Goal", value: `${user.steps.goal.toLocaleString()} steps/day` },
        ].map((item, i, arr) => (
          <View
            key={i}
            style={[
              styles.row,
              i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
          >
            <Text style={[styles.rowTitle, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              {item.label}
            </Text>
            <Text style={[styles.rowSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.infoBox, { backgroundColor: colors.accent, borderColor: colors.primary + "30" }]}>
        <Text style={[styles.infoTitle, { color: colors.accentForeground, fontFamily: "Inter_600SemiBold" }]}>
          How it works
        </Text>
        <Text style={[styles.infoText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          StepConnect reads your step data directly from Apple Health via the CoreMotion Pedometer. Your data stays on your device — it is never sent anywhere.
        </Text>
        <Text style={[styles.infoText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Friends' step counts are simulated for the PoC. A production build would connect to a shared backend where friends opt-in to share their stats.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  profileInfo: { gap: 4 },
  profileName: { fontSize: 20 },
  profileSub: { fontSize: 14 },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    padding: 16,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 4,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  rowIcon: {
    fontSize: 20,
    width: 28,
    textAlign: "center",
  },
  rowInfo: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 15 },
  rowSub: { fontSize: 13 },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  actionBtnText: { fontSize: 13 },
  permissionNote: {
    borderRadius: 10,
    padding: 12,
  },
  permissionNoteText: {
    fontSize: 12,
    lineHeight: 18,
  },
  infoBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 10,
  },
  infoTitle: { fontSize: 15 },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
});

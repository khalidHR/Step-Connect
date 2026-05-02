import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useI18n } from "@/context/I18nContext";
import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

function healthStatusInfo(status: string, t: (k: any) => string) {
  switch (status) {
    case "available": return { label: t("healthConnected"), color: "#16a34a", icon: "✅" };
    case "checking": return { label: t("healthChecking"), color: "#94a3b8", icon: "⏳" };
    case "denied": return { label: t("healthDenied"), color: "#ef4444", icon: "❌" };
    case "unavailable": return { label: t("healthUnavailable"), color: "#f59e0b", icon: "⚠️" };
    case "web": return { label: t("healthWeb"), color: "#94a3b8", icon: "📱" };
    default: return { label: "–", color: "#94a3b8", icon: "?" };
  }
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, lang, setLang, isRTL } = useI18n();
  const { user, healthStatus, toggleWheelchairMode, refreshHealthData, setGoal } = useUser();

  const topPad = Platform.OS === "web" ? 24 : insets.top;
  const bottomPad = Platform.OS === "web" ? 24 : insets.bottom + 20;

  const [goalInput, setGoalInput] = useState(user.steps.goal.toString());
  const [goalError, setGoalError] = useState("");
  const healthInfo = healthStatusInfo(healthStatus, t);

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleGoalSave = () => {
    const n = parseInt(goalInput.replace(/[^0-9]/g, ""), 10);
    if (isNaN(n) || n < 1000 || n > 100000) {
      setGoalError(isRTL ? "أدخل قيمة بين 1,000 و 100,000" : "Enter a value between 1,000 and 100,000");
      return;
    }
    setGoalError("");
    setGoal(n);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleToggleWheelchair = async () => {
    await Haptics.selectionAsync();
    toggleWheelchairMode();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
          {t("settings")}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}
      >
        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: user.color }]}>
            <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>{user.initials}</Text>
          </View>
          <View>
            <Text style={[styles.profileName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {user.name}
            </Text>
            <Text style={[styles.profileSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {user.steps.today.toLocaleString()} {t("steps")} {isRTL ? "اليوم" : "today"}
            </Text>
          </View>
        </View>

        {/* ── Daily Goal ── */}
        <SectionLabel label={isRTL ? "الهدف اليومي" : "DAILY GOAL"} colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.rowTitle, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
            {isRTL ? "هدف الخطوات اليومية" : "Step Goal"}
          </Text>
          <Text style={[styles.rowSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 12 }]}>
            {isRTL ? "الهدف الحالي:" : "Current goal:"} {user.steps.goal.toLocaleString()} {t("steps")}
          </Text>
          <View style={styles.goalInputRow}>
            <TextInput
              style={[
                styles.goalInput,
                {
                  backgroundColor: colors.muted,
                  color: colors.foreground,
                  borderColor: goalError ? "#ef4444" : colors.border,
                  fontFamily: "Inter_600SemiBold",
                  textAlign: isRTL ? "right" : "left",
                },
              ]}
              value={goalInput}
              onChangeText={(v) => {
                setGoalInput(v);
                setGoalError("");
              }}
              keyboardType="numeric"
              placeholder={isRTL ? "مثال: 10000" : "e.g. 10000"}
              placeholderTextColor={colors.mutedForeground}
              onSubmitEditing={handleGoalSave}
              returnKeyType="done"
              maxLength={6}
            />
            <Pressable
              onPress={handleGoalSave}
              style={({ pressed }) => [
                styles.saveBtn,
                { backgroundColor: pressed ? colors.secondary : colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={[styles.saveBtnText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}>
                {isRTL ? "حفظ" : "Save"}
              </Text>
            </Pressable>
          </View>
          {goalError !== "" && (
            <Text style={[styles.goalError, { color: "#ef4444", fontFamily: "Inter_400Regular" }]}>
              {goalError}
            </Text>
          )}
          <View style={[styles.goalPresets, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            {[5000, 8000, 10000, 15000].map((n) => (
              <Pressable
                key={n}
                onPress={() => {
                  setGoalInput(n.toString());
                  setGoal(n);
                  setGoalError("");
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={({ pressed }) => [
                  styles.preset,
                  {
                    backgroundColor: user.steps.goal === n ? colors.primary : colors.muted,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[styles.presetText, { color: user.steps.goal === n ? colors.primaryForeground : colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  {n >= 1000 ? `${n / 1000}k` : n}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Language ── */}
        <SectionLabel label={isRTL ? "اللغة" : "LANGUAGE"} colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: "row", gap: 10 }]}>
          {(["en", "ar"] as const).map((l) => (
            <Pressable
              key={l}
              onPress={async () => {
                await Haptics.selectionAsync();
                setLang(l);
              }}
              style={[
                styles.langBtn,
                {
                  backgroundColor: lang === l ? colors.primary : colors.muted,
                  flex: 1,
                },
              ]}
            >
              <Text style={styles.langFlag}>{l === "en" ? "🇬🇧" : "🇸🇦"}</Text>
              <Text style={[styles.langLabel, { color: lang === l ? colors.primaryForeground : colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                {l === "en" ? t("english") : t("arabic")}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Apple Health ── */}
        <SectionLabel label={isRTL ? "APPLE HEALTH" : "APPLE HEALTH"} colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.row, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View style={[styles.rowLeft, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Text style={styles.rowIcon}>{healthInfo.icon}</Text>
              <View style={styles.rowInfo}>
                <Text style={[styles.rowTitle, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {t("healthIntegration")}
                </Text>
                <Text style={[styles.rowSub, { color: healthInfo.color, fontFamily: "Inter_400Regular" }]}>
                  {healthInfo.label}
                </Text>
              </View>
            </View>
            {healthStatus === "available" && (
              <Pressable
                onPress={async () => { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); await refreshHealthData(); }}
                style={({ pressed }) => [styles.miniBtn, { backgroundColor: pressed ? colors.secondary : colors.muted, opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={[styles.miniBtnText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  {t("refresh")}
                </Text>
              </Pressable>
            )}
          </View>
          {healthStatus === "denied" && (
            <View style={[styles.note, { backgroundColor: "#fef3c7" }]}>
              <Text style={[styles.noteText, { color: "#92400e", fontFamily: "Inter_400Regular" }]}>
                {isRTL ? "اذهب إلى الإعدادات ← الخصوصية ← الحركة" : "Settings → Privacy → Motion & Fitness → enable StepConnect"}
              </Text>
            </View>
          )}
        </View>

        {/* ── Accessibility ── */}
        <SectionLabel label={isRTL ? "إمكانية الوصول" : "ACCESSIBILITY"} colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.row, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View style={[styles.rowLeft, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Text style={styles.rowIcon}>♿</Text>
              <View style={styles.rowInfo}>
                <Text style={[styles.rowTitle, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {t("wheelchairMode")}
                </Text>
                <Text style={[styles.rowSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {t("wheelchairSub")}
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

        {/* ── About ── */}
        <SectionLabel label={isRTL ? "حول التطبيق" : "ABOUT"} colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, gap: 10 }]}>
          {[
            { label: isRTL ? "الإصدار" : "Version", value: "1.0.0 (PoC)" },
            { label: isRTL ? "النظام" : "Platform", value: Platform.OS },
            { label: isRTL ? "مصدر الخطوات" : "Step Source", value: healthStatus === "available" ? "Apple Health" : "N/A" },
          ].map((item, i) => (
            <View key={i} style={[styles.row, { flexDirection: isRTL ? "row-reverse" : "row", borderBottomWidth: i < 2 ? 1 : 0, borderBottomColor: colors.border, paddingBottom: i < 2 ? 10 : 0 }]}>
              <Text style={[styles.rowTitle, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{item.label}</Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SectionLabel({ label, colors }: { label: string; colors: ReturnType<typeof import("@/hooks/useColors").useColors> }) {
  return (
    <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{label}</Text>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20 },
  scroll: { paddingHorizontal: 20, gap: 8 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
    marginBottom: 10,
  },
  avatar: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 20 },
  profileName: { fontSize: 18 },
  profileSub: { fontSize: 13, marginTop: 2 },
  sectionLabel: { fontSize: 11, letterSpacing: 0.6, fontFamily: "Inter_500Medium", marginTop: 8, marginLeft: 4 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 4 },
  row: { alignItems: "center", justifyContent: "space-between" },
  rowLeft: { alignItems: "center", gap: 10, flex: 1 },
  rowIcon: { fontSize: 20, width: 28, textAlign: "center" },
  rowInfo: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 15 },
  rowSub: { fontSize: 13 },
  goalInputRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  goalInput: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 16 },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  saveBtnText: { fontSize: 14 },
  goalError: { fontSize: 12, marginTop: 6 },
  goalPresets: { gap: 8, marginTop: 12 },
  preset: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  presetText: { fontSize: 13 },
  note: { marginTop: 10, borderRadius: 10, padding: 10 },
  noteText: { fontSize: 12, lineHeight: 18 },
  miniBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  miniBtnText: { fontSize: 13 },
  langBtn: { paddingVertical: 12, borderRadius: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
  langFlag: { fontSize: 18 },
  langLabel: { fontSize: 14 },
});

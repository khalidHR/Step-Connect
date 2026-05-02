import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FriendCard } from "@/components/FriendCard";
import { Friend, useUser } from "@/context/UserContext";
import { useI18n } from "@/context/I18nContext";
import { useColors } from "@/hooks/useColors";

type AddTab = "email" | "scan" | "myqr";

export default function FriendsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, friends, availableFriends, addFriend, removeFriend } = useUser();
  const { t, isRTL } = useI18n();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 24;

  const [showAdd, setShowAdd] = useState(false);
  const [addTab, setAddTab] = useState<AddTab>("email");
  const [query, setQuery] = useState("");
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  const searchResults = query.trim().length > 0
    ? availableFriends.filter(
        (f) =>
          f.name.toLowerCase().includes(query.toLowerCase()) ||
          `${f.id}@stepconnect.app`.includes(query.toLowerCase())
      )
    : [];

  const handleAddFriend = async (friend: Friend) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addFriend(friend);
    setQuery("");
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setScannedResult("QR image selected — scanning is processed on device");
    }
  };

  const handleCamera = async () => {
    if (Platform.OS === "web") {
      setScannedResult(t("cameraNotAvailable"));
      return;
    }
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setScannedResult(t("noCameraPermission"));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setScannedResult("QR scanned — processing code…");
    }
  };

  const myQrData = JSON.stringify({ id: user.id, name: user.name, app: "stepconnect" });

  const TABS: { key: AddTab; icon: string; label: string }[] = [
    { key: "email", icon: "✉️", label: t("addByEmail") },
    { key: "scan", icon: "📷", label: t("scanQR") },
    { key: "myqr", icon: "🔲", label: t("myQR") },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <FriendCard friend={item} onRemove={removeFriend} />
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={[styles.header, { paddingTop: topPad + 16 }]}>
            {/* Back */}
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
              hitSlop={12}
            >
              <Text style={[styles.backIcon, { color: colors.foreground }]}>{isRTL ? "→" : "←"}</Text>
              <Text style={[styles.backLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {t("settings")}
              </Text>
            </Pressable>

            <View style={[styles.titleRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <View>
                <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold", textAlign: isRTL ? "right" : "left" }]}>
                  {t("friends")}
                </Text>
                <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: isRTL ? "right" : "left" }]}>
                  {friends.length} {t("connected")}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowAdd(true);
                }}
                style={({ pressed }) => [
                  styles.addBtn,
                  { backgroundColor: pressed ? colors.secondary : colors.primary, opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <Text style={[styles.addBtnText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}>
                  + {t("addFriend")}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👣</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              {t("noFriends")}
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {t("noFriendsSub")}
            </Text>
            <Pressable
              onPress={() => setShowAdd(true)}
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.emptyBtnText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}>
                + {t("addFriend")}
              </Text>
            </Pressable>
          </View>
        )}
      />

      {/* Add Friend Modal */}
      <Modal
        visible={showAdd}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAdd(false)}
      >
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.muted }]} />

          {/* Modal header */}
          <View style={[styles.modalHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {t("addFriend")}
            </Text>
            <Pressable
              onPress={() => { setShowAdd(false); setQuery(""); setScannedResult(null); }}
              style={[styles.doneBtn, { backgroundColor: colors.muted }]}
            >
              <Text style={[styles.doneBtnText, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                {t("done")}
              </Text>
            </Pressable>
          </View>

          {/* Tab selector */}
          <View style={[styles.tabRow, { backgroundColor: colors.muted }]}>
            {TABS.map((tab) => (
              <Pressable
                key={tab.key}
                onPress={() => { setAddTab(tab.key); setScannedResult(null); }}
                style={[
                  styles.tab,
                  addTab === tab.key && { backgroundColor: colors.card, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
                ]}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={[styles.tabLabel, { color: addTab === tab.key ? colors.foreground : colors.mutedForeground, fontFamily: addTab === tab.key ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>

            {/* Email tab */}
            {addTab === "email" && (
              <View style={styles.tabContent}>
                <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={styles.searchIcon}>🔍</Text>
                  <TextInput
                    style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular", textAlign: isRTL ? "right" : "left" }]}
                    placeholder={t("inputPlaceholder")}
                    placeholderTextColor={colors.mutedForeground}
                    value={query}
                    onChangeText={setQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                  />
                  {query.length > 0 && (
                    <Pressable onPress={() => setQuery("")} hitSlop={8}>
                      <Text style={[styles.clearIcon, { color: colors.mutedForeground }]}>✕</Text>
                    </Pressable>
                  )}
                </View>

                {query.trim().length === 0 ? (
                  <View style={styles.hintBox}>
                    <Text style={[styles.hintText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: isRTL ? "right" : "left" }]}>
                      {t("enterToSearch")}
                    </Text>
                    <Text style={[styles.hintText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: isRTL ? "right" : "left" }]}>
                      {t("orScanQR")}
                    </Text>
                  </View>
                ) : searchResults.length === 0 ? (
                  <Text style={[styles.noResults, { color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: isRTL ? "right" : "left" }]}>
                    {t("noResults")}
                  </Text>
                ) : (
                  searchResults.map((f) => (
                    <View key={f.id} style={styles.resultRow}>
                      <View style={[styles.resultAvatar, { backgroundColor: f.color }]}>
                        <Text style={[styles.resultInitials, { fontFamily: "Inter_700Bold" }]}>{f.initials}</Text>
                      </View>
                      <View style={styles.resultInfo}>
                        <Text style={[styles.resultName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{f.name}</Text>
                        <Text style={[styles.resultEmail, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{f.id}@stepconnect.app</Text>
                      </View>
                      <Pressable
                        onPress={() => handleAddFriend(f)}
                        style={({ pressed }) => [styles.addResultBtn, { backgroundColor: pressed ? colors.secondary : colors.primary, opacity: pressed ? 0.9 : 1 }]}
                      >
                        <Text style={[styles.addResultBtnText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}>{t("add")}</Text>
                      </Pressable>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* QR Scan tab */}
            {addTab === "scan" && (
              <View style={styles.tabContent}>
                <View style={[styles.scanCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={styles.scanIllustration}>📷</Text>
                  <Text style={[styles.scanTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold", textAlign: "center" }]}>
                    {t("scanQR")}
                  </Text>
                  {Platform.OS === "web" ? (
                    <Text style={[styles.scanSubtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" }]}>
                      {t("cameraNotAvailable")}
                    </Text>
                  ) : (
                    <Text style={[styles.scanSubtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" }]}>
                      Point your camera at a friend's QR code to add them
                    </Text>
                  )}
                  {scannedResult && (
                    <View style={[styles.scannedBox, { backgroundColor: colors.accent }]}>
                      <Text style={[styles.scannedText, { color: colors.accentForeground, fontFamily: "Inter_500Medium", textAlign: "center" }]}>
                        {scannedResult}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.scanActions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                    <Pressable
                      onPress={handleCamera}
                      style={({ pressed }) => [styles.scanBtn, { backgroundColor: pressed ? colors.secondary : colors.primary, opacity: pressed ? 0.9 : 1, flex: 1 }]}
                    >
                      <Text style={styles.scanBtnIcon}>📸</Text>
                      <Text style={[styles.scanBtnText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}>Camera</Text>
                    </Pressable>
                    <Pressable
                      onPress={handlePickImage}
                      style={({ pressed }) => [styles.scanBtn, { backgroundColor: pressed ? colors.secondary : colors.muted, opacity: pressed ? 0.9 : 1, flex: 1 }]}
                    >
                      <Text style={styles.scanBtnIcon}>🖼️</Text>
                      <Text style={[styles.scanBtnText, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Upload</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Quick-add from available */}
                <Text style={[styles.orLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium", textAlign: "center" }]}>
                  — or add from suggested —
                </Text>
                {availableFriends.slice(0, 3).map((f) => (
                  <View key={f.id} style={styles.resultRow}>
                    <View style={[styles.resultAvatar, { backgroundColor: f.color }]}>
                      <Text style={[styles.resultInitials, { fontFamily: "Inter_700Bold" }]}>{f.initials}</Text>
                    </View>
                    <View style={styles.resultInfo}>
                      <Text style={[styles.resultName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{f.name}</Text>
                      <Text style={[styles.resultEmail, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{f.steps.today.toLocaleString()} steps today</Text>
                    </View>
                    <Pressable
                      onPress={() => handleAddFriend(f)}
                      style={({ pressed }) => [styles.addResultBtn, { backgroundColor: pressed ? colors.secondary : colors.primary, opacity: pressed ? 0.9 : 1 }]}
                    >
                      <Text style={[styles.addResultBtnText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}>{t("add")}</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* My QR tab */}
            {addTab === "myqr" && (
              <View style={[styles.tabContent, { alignItems: "center" }]}>
                <View style={[styles.qrCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.qrAvatar, { backgroundColor: user.color }]}>
                    <Text style={[styles.qrAvatarText, { fontFamily: "Inter_700Bold" }]}>{user.initials}</Text>
                  </View>
                  <Text style={[styles.qrName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                    {user.name}
                  </Text>
                  <Text style={[styles.qrSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {t("yourCode")}
                  </Text>
                  <View style={[styles.qrBox, { backgroundColor: "#fff", borderColor: colors.border }]}>
                    <QRCode
                      value={myQrData}
                      size={180}
                      color="#111827"
                      backgroundColor="#fff"
                    />
                  </View>
                  <Text style={[styles.qrHelp, { color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" }]}>
                    {t("shareCode")}
                  </Text>
                </View>
              </View>
            )}

          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  cardWrap: { paddingHorizontal: 20 },
  header: { paddingHorizontal: 20, paddingBottom: 16, gap: 16 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  backIcon: { fontSize: 20 },
  backLabel: { fontSize: 15 },
  titleRow: { alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 26 },
  subtitle: { fontSize: 14, marginTop: 2 },
  addBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 22 },
  addBtnText: { fontSize: 14 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 20 },
  emptySub: { fontSize: 14, textAlign: "center" },
  emptyBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 22 },
  emptyBtnText: { fontSize: 15 },
  modal: { flex: 1, paddingTop: 12 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  modalHeader: { paddingHorizontal: 20, alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  modalTitle: { fontSize: 22 },
  doneBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  doneBtnText: { fontSize: 14 },
  tabRow: { flexDirection: "row", marginHorizontal: 20, borderRadius: 14, padding: 4, marginBottom: 4 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 11, gap: 3 },
  tabIcon: { fontSize: 16 },
  tabLabel: { fontSize: 11 },
  modalBody: { flex: 1, paddingHorizontal: 20 },
  tabContent: { paddingTop: 16, gap: 12 },
  searchBox: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15 },
  clearIcon: { fontSize: 16 },
  hintBox: { alignItems: "center", paddingVertical: 30, gap: 8 },
  hintText: { fontSize: 14 },
  noResults: { textAlign: "center", paddingVertical: 30, fontSize: 14 },
  resultRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  resultAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  resultInitials: { color: "#fff", fontSize: 15 },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 15 },
  resultEmail: { fontSize: 12, marginTop: 2 },
  addResultBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  addResultBtnText: { fontSize: 13 },
  scanCard: { borderRadius: 20, borderWidth: 1, padding: 20, alignItems: "center", gap: 12 },
  scanIllustration: { fontSize: 52 },
  scanTitle: { fontSize: 17 },
  scanSubtitle: { fontSize: 13, lineHeight: 20, maxWidth: 260 },
  scannedBox: { borderRadius: 10, padding: 12, width: "100%" },
  scannedText: { fontSize: 13 },
  scanActions: { gap: 10, width: "100%", marginTop: 4 },
  scanBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 14, gap: 8 },
  scanBtnIcon: { fontSize: 18 },
  scanBtnText: { fontSize: 14 },
  orLabel: { fontSize: 13, marginVertical: 4 },
  qrCard: { borderRadius: 24, borderWidth: 1, padding: 24, alignItems: "center", gap: 10, width: "100%" },
  qrAvatar: { width: 68, height: 68, borderRadius: 34, alignItems: "center", justifyContent: "center" },
  qrAvatarText: { color: "#fff", fontSize: 24 },
  qrName: { fontSize: 20 },
  qrSub: { fontSize: 13 },
  qrBox: { borderRadius: 16, borderWidth: 1, padding: 16, marginVertical: 6 },
  qrHelp: { fontSize: 13, maxWidth: 220, lineHeight: 18 },
});

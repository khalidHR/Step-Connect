import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FriendCard } from "@/components/FriendCard";
import { Friend, useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

export default function FriendsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { friends, availableFriends, addFriend, removeFriend } = useUser();
  const [showAddModal, setShowAddModal] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : 100;

  const handleAddFriend = async (friend: Friend) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addFriend(friend);
    if (availableFriends.length <= 1) setShowAddModal(false);
  };

  const handleRemoveFriend = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    removeFriend(id);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        scrollEnabled={friends.length > 4}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          { paddingTop: topPad + 16, paddingBottom: bottomPad },
        ]}
        renderItem={({ item }) => (
          <FriendCard
            friend={item}
            onRemove={handleRemoveFriend}
          />
        )}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <View>
              <Text
                style={[
                  styles.title,
                  { color: colors.foreground, fontFamily: "Inter_700Bold" },
                ]}
              >
                Friends
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                ]}
              >
                {friends.length} connected
              </Text>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowAddModal(true);
              }}
              style={({ pressed }) => [
                styles.addButton,
                {
                  backgroundColor: pressed ? colors.secondary : colors.primary,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.addButtonText,
                  { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" },
                ]}
              >
                + Add
              </Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon, { color: colors.mutedForeground }]}>👣</Text>
            <Text
              style={[
                styles.emptyTitle,
                { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              No friends yet
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
              ]}
            >
              Add friends to start competing on the leaderboard
            </Text>
            <Pressable
              onPress={() => setShowAddModal(true)}
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.emptyButtonText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}>
                Find Friends
              </Text>
            </Pressable>
          </View>
        )}
      />

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHandle, { backgroundColor: colors.muted }]} />
          <View style={styles.modalHeader}>
            <Text
              style={[
                styles.modalTitle,
                { color: colors.foreground, fontFamily: "Inter_700Bold" },
              ]}
            >
              Add Friends
            </Text>
            <Pressable
              onPress={() => setShowAddModal(false)}
              style={[styles.closeBtn, { backgroundColor: colors.muted }]}
            >
              <Text style={[styles.closeBtnText, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                Done
              </Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.modalList}
            showsVerticalScrollIndicator={false}
          >
            {availableFriends.length === 0 ? (
              <View style={styles.emptyModal}>
                <Text
                  style={[
                    styles.emptyModalText,
                    { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                  ]}
                >
                  You've added everyone! Check back later.
                </Text>
              </View>
            ) : (
              availableFriends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  showAdd
                  onAdd={handleAddFriend}
                />
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
  },
  addButtonText: {
    fontSize: 15,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 22,
  },
  emptyButtonText: {
    fontSize: 15,
  },
  modal: {
    flex: 1,
    paddingTop: 12,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
  },
  closeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  closeBtnText: {
    fontSize: 14,
  },
  modalList: {
    paddingHorizontal: 20,
  },
  emptyModal: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyModalText: {
    fontSize: 15,
    textAlign: "center",
  },
});

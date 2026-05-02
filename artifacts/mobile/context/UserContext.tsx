import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pedometer } from "expo-sensors";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";

export interface Friend {
  id: string;
  name: string;
  initials: string;
  color: string;
  steps: {
    today: number;
    goal: number;
    weekly: number[];
    monthly: number;
    streak: number;
  };
}

export interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
  isWheelchairMode: boolean;
  steps: {
    today: number;
    goal: number;
    weekly: number[];
    monthly: number;
    streak: number;
  };
}

export type HealthStatus =
  | "checking"
  | "available"
  | "unavailable"
  | "denied"
  | "web";

const MOCK_FRIENDS: Friend[] = [
  {
    id: "f1",
    name: "Alex Chen",
    initials: "AC",
    color: "#0284c7",
    steps: {
      today: 12450,
      goal: 10000,
      weekly: [9200, 11400, 8700, 13200, 10800, 12450, 0],
      monthly: 324000,
      streak: 14,
    },
  },
  {
    id: "f2",
    name: "Sam Rivera",
    initials: "SR",
    color: "#7c3aed",
    steps: {
      today: 15620,
      goal: 12000,
      weekly: [14200, 13800, 16100, 15400, 11900, 14700, 15620],
      monthly: 412000,
      streak: 21,
    },
  },
  {
    id: "f3",
    name: "Jordan Kim",
    initials: "JK",
    color: "#db2777",
    steps: {
      today: 9870,
      goal: 10000,
      weekly: [8400, 9700, 7800, 10200, 9100, 8900, 9870],
      monthly: 267000,
      streak: 7,
    },
  },
  {
    id: "f4",
    name: "Taylor Singh",
    initials: "TS",
    color: "#ea580c",
    steps: {
      today: 7340,
      goal: 8000,
      weekly: [6900, 7200, 6400, 7800, 6700, 7000, 7340],
      monthly: 198000,
      streak: 5,
    },
  },
];

const AVAILABLE_FRIENDS: Friend[] = [
  {
    id: "af1",
    name: "Morgan Lee",
    initials: "ML",
    color: "#0891b2",
    steps: {
      today: 6800,
      goal: 8000,
      weekly: [5500, 6800, 7200, 6100, 6900, 7400, 6800],
      monthly: 189000,
      streak: 3,
    },
  },
  {
    id: "af2",
    name: "Chris Park",
    initials: "CP",
    color: "#16a34a",
    steps: {
      today: 11200,
      goal: 10000,
      weekly: [10400, 11700, 9800, 12100, 10600, 11000, 11200],
      monthly: 298000,
      streak: 11,
    },
  },
  {
    id: "af3",
    name: "Riley Johnson",
    initials: "RJ",
    color: "#7c3aed",
    steps: {
      today: 8500,
      goal: 10000,
      weekly: [7200, 8900, 8100, 9400, 7800, 8300, 8500],
      monthly: 234000,
      streak: 6,
    },
  },
];

const DEFAULT_USER: User = {
  id: "me",
  name: "You",
  initials: "ME",
  color: "#16a34a",
  isWheelchairMode: false,
  steps: {
    today: 0,
    goal: 10000,
    weekly: [0, 0, 0, 0, 0, 0, 0],
    monthly: 0,
    streak: 0,
  },
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function fetchWeeklySteps(): Promise<number[]> {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const results: number[] = [];

  for (let i = mondayOffset; i >= 0; i--) {
    const dayDate = daysAgo(i);
    const start = startOfDay(dayDate);
    const end = i === 0 ? today : new Date(start.getTime() + 86400000 - 1);
    try {
      const result = await Pedometer.getStepCountAsync(start, end);
      results.push(result.steps);
    } catch {
      results.push(0);
    }
  }

  const daysLeft = 7 - results.length;
  return [...results, ...Array(daysLeft).fill(0)];
}

async function fetchMonthlySteps(): Promise<number> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  try {
    const result = await Pedometer.getStepCountAsync(start, now);
    return result.steps;
  } catch {
    return 0;
  }
}

async function calculateStreak(): Promise<number> {
  let streak = 0;
  let i = 0;
  const GOAL = 10000;

  while (true) {
    const day = daysAgo(i);
    const start = startOfDay(day);
    const end =
      i === 0
        ? new Date()
        : new Date(start.getTime() + 86400000 - 1);
    try {
      const result = await Pedometer.getStepCountAsync(start, end);
      if (result.steps >= GOAL) {
        streak++;
        i++;
      } else if (i === 0) {
        i++;
      } else {
        break;
      }
    } catch {
      break;
    }
    if (i > 60) break;
  }

  return streak;
}

const STORAGE_KEY = "@stepconnect_settings";

interface UserContextType {
  user: User;
  friends: Friend[];
  availableFriends: Friend[];
  healthStatus: HealthStatus;
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  toggleWheelchairMode: () => void;
  refreshHealthData: () => Promise<void>;
  setGoal: (goal: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [availableFriends, setAvailableFriends] =
    useState<Friend[]>(AVAILABLE_FRIENDS);
  const [healthStatus, setHealthStatus] = useState<HealthStatus>("checking");
  const subscriptionRef = useRef<ReturnType<typeof Pedometer.watchStepCount> | null>(null);

  useEffect(() => {
    loadSettings();
    initHealthTracking();
    return () => {
      subscriptionRef.current?.remove();
    };
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.goal) {
          setUser((prev) => ({
            ...prev,
            steps: { ...prev.steps, goal: parsed.goal },
          }));
        }
        if (parsed.isWheelchairMode !== undefined) {
          setUser((prev) => ({
            ...prev,
            isWheelchairMode: parsed.isWheelchairMode,
          }));
        }
        if (parsed.friends) setFriends(parsed.friends);
        if (parsed.availableFriends)
          setAvailableFriends(parsed.availableFriends);
      }
    } catch {}
  };

  const initHealthTracking = async () => {
    if (Platform.OS === "web") {
      setHealthStatus("web");
      return;
    }

    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        setHealthStatus("unavailable");
        return;
      }

      setHealthStatus("available");
      await loadRealHealthData();

      subscriptionRef.current = Pedometer.watchStepCount((result) => {
        setUser((prev) => {
          const multiplier = prev.isWheelchairMode ? 1.3 : 1;
          const adjustedSteps = Math.round(result.steps * multiplier);
          const newWeekly = [...prev.steps.weekly];
          const todayIdx = new Date().getDay();
          const idx = todayIdx === 0 ? 6 : todayIdx - 1;
          newWeekly[idx] = adjustedSteps;
          return {
            ...prev,
            steps: {
              ...prev.steps,
              today: adjustedSteps,
              weekly: newWeekly,
            },
          };
        });
      });
    } catch {
      setHealthStatus("denied");
    }
  };

  const loadRealHealthData = async () => {
    const [todayResult, weeklyData, monthlySteps, streak] = await Promise.all([
      Pedometer.getStepCountAsync(startOfDay(new Date()), new Date()),
      fetchWeeklySteps(),
      fetchMonthlySteps(),
      calculateStreak(),
    ]);

    setUser((prev) => {
      const multiplier = prev.isWheelchairMode ? 1.3 : 1;
      return {
        ...prev,
        steps: {
          ...prev.steps,
          today: Math.round(todayResult.steps * multiplier),
          weekly: weeklyData.map((s) => Math.round(s * multiplier)),
          monthly: Math.round(monthlySteps * multiplier),
          streak,
        },
      };
    });
  };

  const refreshHealthData = useCallback(async () => {
    if (healthStatus !== "available") return;
    await loadRealHealthData();
  }, [healthStatus]);

  const saveSettings = useCallback(
    async (
      updatedFriends: Friend[],
      updatedAvailable: Friend[],
      isWheelchairMode: boolean,
      goal: number
    ) => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ friends: updatedFriends, availableFriends: updatedAvailable, isWheelchairMode, goal })
        );
      } catch {}
    },
    []
  );

  const addFriend = useCallback(
    (friend: Friend) => {
      setFriends((prev) => {
        const updated = [...prev, friend];
        saveSettings(updated, availableFriends.filter((f) => f.id !== friend.id), user.isWheelchairMode, user.steps.goal);
        return updated;
      });
      setAvailableFriends((prev) => prev.filter((f) => f.id !== friend.id));
    },
    [availableFriends, user, saveSettings]
  );

  const removeFriend = useCallback(
    (friendId: string) => {
      setFriends((prev) => {
        const removed = prev.find((f) => f.id === friendId);
        const updated = prev.filter((f) => f.id !== friendId);
        const newAvailable = removed ? [...availableFriends, removed] : availableFriends;
        saveSettings(updated, newAvailable, user.isWheelchairMode, user.steps.goal);
        return updated;
      });
      setAvailableFriends((prev) => {
        const removed = friends.find((f) => f.id === friendId);
        return removed ? [...prev, removed] : prev;
      });
    },
    [friends, availableFriends, user, saveSettings]
  );

  const toggleWheelchairMode = useCallback(() => {
    setUser((prev) => {
      const next = { ...prev, isWheelchairMode: !prev.isWheelchairMode };
      saveSettings(friends, availableFriends, next.isWheelchairMode, next.steps.goal);
      return next;
    });
  }, [friends, availableFriends, saveSettings]);

  const setGoal = useCallback(
    (goal: number) => {
      setUser((prev) => {
        const next = { ...prev, steps: { ...prev.steps, goal } };
        saveSettings(friends, availableFriends, next.isWheelchairMode, goal);
        return next;
      });
    },
    [friends, availableFriends, saveSettings]
  );

  return (
    <UserContext.Provider
      value={{
        user,
        friends,
        availableFriends,
        healthStatus,
        addFriend,
        removeFriend,
        toggleWheelchairMode,
        refreshHealthData,
        setGoal,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}

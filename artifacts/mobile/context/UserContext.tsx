import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface StepData {
  today: number;
  goal: number;
  weekly: number[];
  monthly: number;
  streak: number;
}

export interface Friend {
  id: string;
  name: string;
  initials: string;
  color: string;
  steps: StepData;
  isWheelchairMode?: boolean;
}

export interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
  steps: StepData;
  isWheelchairMode: boolean;
}

const AVATAR_COLORS = [
  "#16a34a",
  "#0284c7",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#0891b2",
];

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

interface UserContextType {
  user: User;
  friends: Friend[];
  availableFriends: Friend[];
  addSteps: (amount: number) => void;
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  toggleWheelchairMode: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = "@stepconnect_data";

const defaultUser: User = {
  id: "me",
  name: "You",
  initials: "ME",
  color: "#16a34a",
  isWheelchairMode: false,
  steps: {
    today: 4280,
    goal: 10000,
    weekly: [6200, 8100, 9400, 7300, 5800, 6900, 4280],
    monthly: 245000,
    streak: 9,
  },
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(defaultUser);
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [availableFriends, setAvailableFriends] =
    useState<Friend[]>(AVAILABLE_FRIENDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadData();
    startAutoTracking();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startAutoTracking = () => {
    intervalRef.current = setInterval(() => {
      const increment = Math.floor(Math.random() * 8) + 2;
      setUser((prev) => {
        const newToday = prev.steps.today + increment;
        const newWeekly = [...prev.steps.weekly];
        newWeekly[newWeekly.length - 1] = newToday;
        return {
          ...prev,
          steps: {
            ...prev.steps,
            today: newToday,
            weekly: newWeekly,
            monthly: prev.steps.monthly + increment,
          },
        };
      });
    }, 3000);
  };

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user) setUser(parsed.user);
        if (parsed.friends) setFriends(parsed.friends);
        if (parsed.availableFriends)
          setAvailableFriends(parsed.availableFriends);
      }
    } catch {}
  };

  const saveData = useCallback(
    async (updatedUser: User, updatedFriends: Friend[]) => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ user: updatedUser, friends: updatedFriends }),
        );
      } catch {}
    },
    [],
  );

  const addSteps = useCallback(
    (amount: number) => {
      setUser((prev) => {
        const newToday = prev.steps.today + amount;
        const newWeekly = [...prev.steps.weekly];
        newWeekly[newWeekly.length - 1] = newToday;
        const updated = {
          ...prev,
          steps: {
            ...prev.steps,
            today: newToday,
            weekly: newWeekly,
            monthly: prev.steps.monthly + amount,
          },
        };
        saveData(updated, friends);
        return updated;
      });
    },
    [friends, saveData],
  );

  const addFriend = useCallback(
    (friend: Friend) => {
      setFriends((prev) => {
        const updated = [...prev, friend];
        saveData(user, updated);
        return updated;
      });
      setAvailableFriends((prev) => prev.filter((f) => f.id !== friend.id));
    },
    [user, saveData],
  );

  const removeFriend = useCallback(
    (friendId: string) => {
      setFriends((prev) => {
        const removed = prev.find((f) => f.id === friendId);
        const updated = prev.filter((f) => f.id !== friendId);
        if (removed) setAvailableFriends((af) => [...af, removed]);
        saveData(user, updated);
        return updated;
      });
    },
    [user, saveData],
  );

  const toggleWheelchairMode = useCallback(() => {
    setUser((prev) => ({ ...prev, isWheelchairMode: !prev.isWheelchairMode }));
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        friends,
        availableFriends,
        addSteps,
        addFriend,
        removeFriend,
        toggleWheelchairMode,
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

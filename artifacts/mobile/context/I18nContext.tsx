import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Lang = "en" | "ar";

const T = {
  en: {
    appName: "StepConnect",
    dashboard: "Dashboard",
    steps: "steps",
    ofSteps: "of {goal} steps",
    goal: "Goal",
    distance: "Distance",
    calories: "Calories",
    streak: "day streak",
    friendsToday: "Friends Today",
    youLead: "You're in the lead!",
    isLeading: "{name} is leading",
    thisWeek: "This Week",
    totalSteps: "total steps",
    goalsHit: "goals",
    leaderboard: "Leaderboard",
    todayRankings: "Today's rankings",
    yourRank: "your rank",
    fullRankings: "Full Rankings",
    friends: "Friends",
    connected: "connected",
    addFriend: "Add Friend",
    searchEmail: "Search by email or username",
    scanQR: "Scan QR Code",
    myQR: "My QR Code",
    addByEmail: "Add by Email",
    cameraNotAvailable: "Camera not available on web.\nUse your phone with Expo Go.",
    noFriends: "No friends yet",
    noFriendsSub: "Add friends to start competing",
    noResults: "No users found",
    reports: "Reports",
    activityHistory: "Activity history",
    dailySteps: "Daily Steps",
    weeklySteps: "Weekly Steps",
    thisWeekLabel: "this week",
    thisMonthLabel: "this month",
    bestDay: "Best day this week",
    goalsThisWeek: "Goals hit this week",
    weeklyAvg: "Weekly average",
    monthlyTotal: "Monthly total",
    stepsPerDay: "steps/day",
    days: "days",
    milestones: "Milestones",
    settings: "Settings",
    language: "Language",
    english: "English",
    arabic: "Arabic",
    accessibility: "Accessibility",
    wheelchairMode: "Wheelchair Mode",
    wheelchairSub: "Adjusts step calculations for wheelchair users",
    healthIntegration: "Apple Health",
    healthConnected: "Connected",
    healthChecking: "Checking…",
    healthDenied: "Access denied",
    healthUnavailable: "Not available",
    healthWeb: "iOS only",
    refresh: "Refresh",
    about: "About",
    version: "Version",
    platform: "Platform",
    stepSource: "Step Source",
    howItWorks: "How it works",
    howItWorksText:
      "StepConnect reads your steps from Apple Health via CoreMotion. Your data stays on your device.",
    pocNote:
      "Friends' step counts are simulated for the PoC. A production build would use a shared backend.",
    scanQRPhone: "Scan QR with Expo Go on iPhone for real step data",
    motionDenied: "Motion access denied — tap to retry",
    wheelchairActive: "Wheelchair mode active — push multiplier applied",
    refreshHealth: "Refresh from Apple Health",
    shareProfile: "Share Profile",
    removeAll: "Remove Friend",
    done: "Done",
    add: "Add",
    remove: "Remove",
    prev: "Previous",
    next: "Next",
    cancel: "Cancel",
    tapToScan: "Tap to scan",
    yourCode: "Your personal code",
    shareCode: "Share this code with friends to connect",
    inputPlaceholder: "Enter email or username…",
    addFriendSuccess: "Friend added!",
    noCameraPermission: "Camera permission required",
    requestCamera: "Enable Camera",
    enterToSearch: "Start typing to search",
    orScanQR: "or scan QR code",
  },
  ar: {
    appName: "ستيب كونكت",
    dashboard: "الرئيسية",
    steps: "خطوة",
    ofSteps: "من {goal} خطوة",
    goal: "الهدف",
    distance: "المسافة",
    calories: "السعرات",
    streak: "يوم متواصل",
    friendsToday: "الأصدقاء اليوم",
    youLead: "أنت في المقدمة!",
    isLeading: "{name} في المقدمة",
    thisWeek: "هذا الأسبوع",
    totalSteps: "إجمالي الخطوات",
    goalsHit: "أهداف",
    leaderboard: "المتصدرون",
    todayRankings: "ترتيب اليوم",
    yourRank: "ترتيبك",
    fullRankings: "الترتيب الكامل",
    friends: "الأصدقاء",
    connected: "متصل",
    addFriend: "إضافة صديق",
    searchEmail: "البحث بالبريد أو اسم المستخدم",
    scanQR: "مسح رمز QR",
    myQR: "رمز QR الخاص بي",
    addByEmail: "إضافة بالبريد",
    cameraNotAvailable: "الكاميرا غير متاحة على الويب.\nاستخدم هاتفك مع Expo Go.",
    noFriends: "لا يوجد أصدقاء بعد",
    noFriendsSub: "أضف أصدقاء للمنافسة",
    noResults: "لم يتم العثور على مستخدمين",
    reports: "التقارير",
    activityHistory: "سجل النشاط",
    dailySteps: "خطوات يومية",
    weeklySteps: "خطوات أسبوعية",
    thisWeekLabel: "هذا الأسبوع",
    thisMonthLabel: "هذا الشهر",
    bestDay: "أفضل يوم هذا الأسبوع",
    goalsThisWeek: "أهداف تحققت هذا الأسبوع",
    weeklyAvg: "المتوسط الأسبوعي",
    monthlyTotal: "إجمالي الشهر",
    stepsPerDay: "خطوة / يوم",
    days: "أيام",
    milestones: "الإنجازات",
    settings: "الإعدادات",
    language: "اللغة",
    english: "الإنجليزية",
    arabic: "العربية",
    accessibility: "إمكانية الوصول",
    wheelchairMode: "وضع الكرسي المتحرك",
    wheelchairSub: "يضبط حسابات الخطوات لمستخدمي الكراسي المتحركة",
    healthIntegration: "Apple Health",
    healthConnected: "متصل",
    healthChecking: "جارٍ التحقق…",
    healthDenied: "تم رفض الوصول",
    healthUnavailable: "غير متاح",
    healthWeb: "iOS فقط",
    refresh: "تحديث",
    about: "حول التطبيق",
    version: "الإصدار",
    platform: "النظام",
    stepSource: "مصدر الخطوات",
    howItWorks: "كيف يعمل",
    howItWorksText:
      "يقرأ StepConnect خطواتك من Apple Health عبر CoreMotion. تبقى بياناتك على جهازك.",
    pocNote:
      "خطوات الأصدقاء محاكاة للنموذج الأولي. الإصدار الكامل سيستخدم قاعدة بيانات مشتركة.",
    scanQRPhone: "امسح QR بـ Expo Go على iPhone للحصول على بيانات حقيقية",
    motionDenied: "تم رفض الوصول للحركة — اضغط للمحاولة مرة أخرى",
    wheelchairActive: "وضع الكرسي المتحرك مفعّل — معامل الدفع مطبّق",
    refreshHealth: "تحديث من Apple Health",
    shareProfile: "مشاركة الملف الشخصي",
    removeAll: "إزالة صديق",
    done: "تم",
    add: "إضافة",
    remove: "إزالة",
    prev: "السابق",
    next: "التالي",
    cancel: "إلغاء",
    tapToScan: "اضغط للمسح",
    yourCode: "رمزك الشخصي",
    shareCode: "شارك هذا الرمز مع أصدقائك للتواصل",
    inputPlaceholder: "أدخل البريد أو اسم المستخدم…",
    addFriendSuccess: "تمت إضافة الصديق!",
    noCameraPermission: "مطلوب إذن الكاميرا",
    requestCamera: "تفعيل الكاميرا",
    enterToSearch: "ابدأ الكتابة للبحث",
    orScanQR: "أو امسح رمز QR",
  },
};

export type TKeys = keyof typeof T.en;

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKeys, vars?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LANG_KEY = "@stepconnect_lang";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((saved) => {
      if (saved === "en" || saved === "ar") setLangState(saved);
    });
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem(LANG_KEY, l);
  }, []);

  const t = useCallback(
    (key: TKeys, vars?: Record<string, string | number>): string => {
      let str = (T[lang] as Record<string, string>)[key] ?? (T.en as Record<string, string>)[key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(`{${k}}`, String(v));
        });
      }
      return str;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isRTL: lang === "ar" }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

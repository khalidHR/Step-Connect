import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface WeeklyChartProps {
  data: number[];
  goal?: number;
  height?: number;
}

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function WeeklyChart({ data, goal = 10000, height = 110 }: WeeklyChartProps) {
  const colors = useColors();
  const maxVal = Math.max(...data, goal, 1);
  const todayIdx = new Date().getDay();
  const adjustedTodayIdx = todayIdx === 0 ? 6 : todayIdx - 1;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.chartRow, { height }]}>
        {data.map((val, i) => {
          const barH = Math.max((val / maxVal) * (height - 30), 4);
          const isToday = i === adjustedTodayIdx;
          const metGoal = val >= goal;
          const isFuture = i > adjustedTodayIdx;

          return (
            <View key={i} style={styles.barCol}>
              <View style={[styles.barTrack, { height: height - 28 }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: isFuture ? 4 : barH,
                      backgroundColor: metGoal
                        ? colors.primary
                        : isToday
                        ? colors.accent
                        : colors.muted,
                      borderWidth: isToday ? 0 : 0,
                      opacity: isFuture ? 0.25 : 1,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  {
                    color: isToday ? colors.primary : colors.mutedForeground,
                    fontFamily: isToday ? "Inter_700Bold" : "Inter_400Regular",
                    fontSize: isToday ? 12 : 11,
                  },
                ]}
              >
                {DAYS[i]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  barTrack: {
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "100%",
    borderRadius: 8,
    minHeight: 4,
  },
  dayLabel: {},
});

import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface WeeklyChartProps {
  data: number[];
  goal?: number;
  height?: number;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeeklyChart({ data, goal = 10000, height = 140 }: WeeklyChartProps) {
  const colors = useColors();
  const maxValue = Math.max(...data, goal, 1);

  return (
    <View style={styles.container}>
      <View style={[styles.chartArea, { height }]}>
        {data.map((value, index) => {
          const barHeight = (value / maxValue) * (height - 24);
          const isToday = index === data.length - 1;
          const metGoal = value >= goal;
          const barColor = metGoal ? colors.primary : isToday ? colors.secondary : colors.muted;
          const valueColor = metGoal ? colors.primary : isToday ? colors.foreground : colors.mutedForeground;

          return (
            <View key={index} style={styles.barGroup}>
              <Text
                style={[
                  styles.barValue,
                  {
                    color: valueColor,
                    fontFamily: "Inter_500Medium",
                    opacity: value === 0 ? 0 : 1,
                  },
                ]}
              >
                {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
              </Text>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(barHeight, 4),
                      backgroundColor: metGoal
                        ? colors.primary
                        : isToday
                        ? colors.accent
                        : colors.muted,
                      borderWidth: isToday ? 0 : 0,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  {
                    color: isToday ? colors.primary : colors.mutedForeground,
                    fontFamily: isToday ? "Inter_600SemiBold" : "Inter_400Regular",
                  },
                ]}
              >
                {DAYS[index]}
              </Text>
            </View>
          );
        })}
      </View>

      <View
        style={[styles.goalLine, { borderColor: colors.primary + "40" }]}
      >
        <Text
          style={[
            styles.goalLabel,
            { color: colors.primary, fontFamily: "Inter_500Medium" },
          ]}
        >
          Goal: {(goal / 1000).toFixed(0)}k
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  chartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    paddingBottom: 24,
  },
  barGroup: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  barValue: {
    fontSize: 9,
  },
  barWrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 6,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 11,
    position: "absolute",
    bottom: 0,
  },
  goalLine: {
    position: "absolute",
    bottom: 24,
    right: 0,
    borderTopWidth: 1,
    borderStyle: "dashed",
    paddingTop: 2,
  },
  goalLabel: {
    fontSize: 10,
    textAlign: "right",
  },
});

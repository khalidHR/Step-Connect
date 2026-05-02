import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface StepRingProps {
  steps: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}

export function StepRing({
  steps,
  goal,
  size = 220,
  strokeWidth = 18,
}: StepRingProps) {
  const colors = useColors();
  const progress = Math.min(steps / goal, 1);
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedProgress, {
      toValue: progress,
      useNativeDriver: false,
      tension: 40,
      friction: 8,
    }).start();
  }, [progress]);

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const innerSize = size - strokeWidth * 2 - 24;

  const segments = 48;
  const activeSegments = Math.floor(progress * segments);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.track,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: colors.muted,
          },
        ]}
      />
      {Array.from({ length: activeSegments }).map((_, i) => {
        const angle = (i / segments) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const x = center + radius * Math.cos(rad) - strokeWidth / 2;
        const y = center + radius * Math.sin(rad) - strokeWidth / 2;
        const opacity = 0.4 + (i / segments) * 0.6;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              {
                width: strokeWidth,
                height: strokeWidth,
                borderRadius: strokeWidth / 2,
                backgroundColor: colors.primary,
                left: x,
                top: y,
                opacity,
              },
            ]}
          />
        );
      })}
      <View
        style={[
          styles.innerCircle,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text
          style={[
            styles.stepCount,
            { color: colors.foreground, fontFamily: "Inter_700Bold" },
          ]}
        >
          {steps.toLocaleString()}
        </Text>
        <Text
          style={[
            styles.stepLabel,
            { color: colors.mutedForeground, fontFamily: "Inter_500Medium" },
          ]}
        >
          steps today
        </Text>
        <View
          style={[styles.badge, { backgroundColor: colors.accent }]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                color: colors.accentForeground,
                fontFamily: "Inter_600SemiBold",
              },
            ]}
          >
            {Math.round(progress * 100)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  track: {
    position: "absolute",
  },
  dot: {
    position: "absolute",
  },
  innerCircle: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  stepCount: {
    fontSize: 40,
    lineHeight: 46,
  },
  stepLabel: {
    fontSize: 13,
  },
  badge: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
  },
});

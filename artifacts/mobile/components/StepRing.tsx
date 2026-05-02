import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { useColors } from "@/hooks/useColors";

interface StepRingProps {
  steps: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, endAngle: number): string {
  const clamped = Math.min(endAngle, 359.99);
  const start = polarToCartesian(cx, cy, r, 0);
  const end = polarToCartesian(cx, cy, r, clamped);
  const largeArc = clamped > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export function StepRing({
  steps,
  goal,
  size = 240,
  strokeWidth = 22,
}: StepRingProps) {
  const colors = useColors();
  const progress = Math.min(steps / goal, 1);
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedProgress, {
      toValue: progress,
      useNativeDriver: false,
      tension: 35,
      friction: 9,
    }).start();
  }, [progress]);

  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;
  const pct = Math.round(progress * 100);

  const arcPath = progress > 0 ? describeArc(cx, cy, r, progress * 359.99) : null;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Track */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={colors.muted}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        {arcPath && (
          <Path
            d={arcPath}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        )}
      </Svg>

      <View style={styles.center}>
        <Text
          style={[styles.stepCount, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {steps.toLocaleString()}
        </Text>
        <Text
          style={[styles.goalLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}
        >
          of {goal.toLocaleString()} steps
        </Text>
        <View style={[styles.pctBadge, { backgroundColor: colors.accent }]}>
          <Text style={[styles.pctText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
            {pct}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 20,
  },
  stepCount: {
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -1,
  },
  goalLabel: {
    fontSize: 13,
  },
  pctBadge: {
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pctText: {
    fontSize: 14,
  },
});

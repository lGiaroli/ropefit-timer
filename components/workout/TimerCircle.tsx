import Svg, { Circle } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/lib/theme';

interface TimerCircleProps {
  size?: number;
  strokeWidth?: number;
  progress: number;
  color: string;
  timeLabel: string;
  stateLabel: string;
}

export function TimerCircle({ size = 260, strokeWidth = 16, progress, color, timeLabel, stateLabel }: TimerCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const dashOffset = circumference * (1 - clampedProgress);

  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.surfaceRaised} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={[styles.state, { color }]}>{stateLabel}</Text>
      <Text style={styles.time}>{timeLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  state: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 6,
  },
  time: {
    color: colors.text,
    fontSize: 58,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
});

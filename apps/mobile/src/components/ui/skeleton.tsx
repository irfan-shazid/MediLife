import { useEffect } from 'react';
import { View, type DimensionValue } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/constants/theme';

export function Skeleton({
  width,
  height = 16,
  radius = Radius.sm,
}: {
  width: DimensionValue;
  height?: number;
  radius?: number;
}) {
  const theme = useTheme();
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: theme.border }, animatedStyle]}
    />
  );
}

/** Placeholder that mirrors the icon-bubble + two-line-text shape shared by
 *  DoseRow / MedicineCard / history rows, so loading states don't jump around. */
export function SkeletonRow() {
  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
      <Skeleton width={44} height={44} radius={Radius.md} />
      <View style={{ flex: 1, gap: Spacing.xs }}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} />
      </View>
    </Card>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={{ gap: Spacing.sm }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </View>
  );
}

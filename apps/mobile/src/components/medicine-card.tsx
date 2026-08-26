import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { Medicine } from '@meditime/shared';
import { DAY_LABELS } from '@meditime/shared';
import { ThemedText } from '@/components/themed-text';
import { MedicineIconGlyph } from '@/components/medicine-icon';
import { Card } from '@/components/ui/card';
import { PressableScale } from '@/components/ui/pressable-scale';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/constants/theme';

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function daysSummary(days: number[]) {
  if (days.length === 0 || days.length === 7) return 'Every day';
  return days.map((d) => DAY_LABELS[d]).join(', ');
}

export function MedicineCard({
  medicine,
  onPress,
  index = 0,
}: {
  medicine: Medicine;
  onPress: () => void;
  index?: number;
}) {
  const theme = useTheme();

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify().damping(18)}>
      <PressableScale onPress={onPress} scaleTo={0.98} haptic={false}>
        <Card style={styles.card}>
          <View style={[styles.iconBubble, { backgroundColor: `${medicine.color}22` }]}>
            <MedicineIconGlyph icon={medicine.icon} color={medicine.color} size={22} />
          </View>
          <View style={styles.info}>
            <ThemedText variant="bodyLarge" numberOfLines={1}>
              {medicine.name}
            </ThemedText>
            {medicine.dosage ? (
              <ThemedText variant="caption" color="textSecondary">
                {medicine.dosage}
              </ThemedText>
            ) : null}
            <ThemedText variant="caption" color="textMuted">
              {medicine.times.map(formatTime).join(' · ')} · {daysSummary(medicine.daysOfWeek)}
            </ThemedText>
          </View>
          {!medicine.isActive && (
            <View style={[styles.pausedBadge, { backgroundColor: theme.border }]}>
              <ThemedText variant="caption" color="textSecondary">
                Paused
              </ThemedText>
            </View>
          )}
        </Card>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  pausedBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
});

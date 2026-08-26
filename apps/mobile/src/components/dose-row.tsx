import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from '@/components/themed-text';
import { MedicineIconGlyph } from '@/components/medicine-icon';
import { Card } from '@/components/ui/card';
import { PressableScale } from '@/components/ui/pressable-scale';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/constants/theme';
import type { DoseOccurrence } from '@/lib/schedule';

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function DoseRow({
  dose,
  onTake,
  onSkip,
  busy,
  index = 0,
}: {
  dose: DoseOccurrence;
  onTake: () => void;
  onSkip: () => void;
  busy?: boolean;
  index?: number;
}) {
  const theme = useTheme();
  const { medicine, status } = dose;
  const isResolved = status === 'taken' || status === 'skipped' || status === 'missed';

  function handleTake() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onTake();
  }

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify().damping(18)}>
      <Card style={[styles.card, isResolved && { opacity: 0.55 }]}>
        <View style={[styles.iconBubble, { backgroundColor: `${medicine.color}22` }]}>
          <MedicineIconGlyph icon={medicine.icon} color={medicine.color} size={20} />
        </View>
        <View style={styles.info}>
          <ThemedText variant="bodyLarge" numberOfLines={1}>
            {medicine.name}
          </ThemedText>
          <ThemedText variant="caption" color="textSecondary">
            {formatTime(dose.time)}
            {medicine.dosage ? ` · ${medicine.dosage}` : ''}
          </ThemedText>
        </View>

        {status === 'due' && (
          <View style={styles.actions}>
            <PressableScale
              disabled={busy}
              onPress={onSkip}
              scaleTo={0.85}
              style={[styles.actionBtn, { backgroundColor: theme.border }]}
            >
              <Ionicons name="close" size={18} color={theme.textSecondary} />
            </PressableScale>
            <PressableScale
              disabled={busy}
              onPress={handleTake}
              scaleTo={0.85}
              style={[styles.actionBtn, { backgroundColor: theme.primary }]}
            >
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            </PressableScale>
          </View>
        )}

        {status === 'taken' && (
          <Animated.View entering={ZoomIn.springify().damping(12)}>
            <Ionicons name="checkmark-circle" size={24} color={theme.success} />
          </Animated.View>
        )}
        {status === 'skipped' && <Ionicons name="close-circle" size={24} color={theme.textMuted} />}
        {status === 'upcoming' && (
          <ThemedText variant="caption" color="textMuted">
            Upcoming
          </ThemedText>
        )}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

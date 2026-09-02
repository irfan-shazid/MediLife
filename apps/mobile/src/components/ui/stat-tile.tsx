import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export const StatTile = memo(function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  const theme = useTheme();
  return (
    <Card style={styles.tile}>
      <View style={[styles.dot, { backgroundColor: accent ?? theme.primary }]} />
      <ThemedText variant="heading">{value}</ThemedText>
      <ThemedText variant="caption" color="textSecondary">
        {label}
      </ThemedText>
    </Card>
  );
});

const styles = StyleSheet.create({
  tile: { flex: 1, minWidth: 140 },
  dot: { width: 8, height: 8, borderRadius: 4, marginBottom: Spacing.xs },
});

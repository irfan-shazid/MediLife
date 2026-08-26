import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export function OrDivider() {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.line, { backgroundColor: theme.border }]} />
      <ThemedText variant="caption" color="textMuted">
        or
      </ThemedText>
      <View style={[styles.line, { backgroundColor: theme.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
});

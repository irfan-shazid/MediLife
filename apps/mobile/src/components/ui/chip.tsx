import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { PressableScale } from '@/components/ui/pressable-scale';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/constants/theme';

export function Chip({
  label,
  selected,
  onPress,
  color,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}) {
  const theme = useTheme();
  const activeColor = color ?? theme.primary;

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.9}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? activeColor : theme.card,
          borderColor: selected ? activeColor : theme.border,
        },
      ]}
    >
      <ThemedText
        variant="caption"
        style={{ color: selected ? '#FFFFFF' : theme.textSecondary, fontWeight: '600' }}
      >
        {label}
      </ThemedText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

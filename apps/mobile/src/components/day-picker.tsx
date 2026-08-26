import { View, StyleSheet } from 'react-native';
import { DAY_LABELS } from '@meditime/shared';
import { Chip } from '@/components/ui/chip';
import { Spacing } from '@/constants/theme';

export function DayPicker({
  value,
  onChange,
}: {
  value: number[];
  onChange: (days: number[]) => void;
}) {
  function toggle(day: number) {
    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day));
    } else {
      onChange([...value, day].sort());
    }
  }

  return (
    <View style={styles.row}>
      <Chip label="Every day" selected={value.length === 0} onPress={() => onChange([])} />
      {DAY_LABELS.map((label, day) => (
        <Chip key={label} label={label} selected={value.includes(day)} onPress={() => toggle(day)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});

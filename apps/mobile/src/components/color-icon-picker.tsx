import { Pressable, View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { medicineColors, medicineIcons, type MedicineIcon } from '@meditime/shared';
import { MedicineIconGlyph } from '@/components/medicine-icon';
import { Radius, Spacing } from '@/constants/theme';

export function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <View style={styles.row}>
      {medicineColors.map((c) => (
        <Pressable
          key={c}
          onPress={() => onChange(c)}
          style={[styles.swatch, { backgroundColor: c }, value === c && styles.swatchSelected]}
        >
          {value === c && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
        </Pressable>
      ))}
    </View>
  );
}

export function IconPicker({
  value,
  onChange,
  color,
}: {
  value: MedicineIcon;
  onChange: (icon: MedicineIcon) => void;
  color: string;
}) {
  return (
    <View style={styles.row}>
      {medicineIcons.map((icon) => (
        <Pressable
          key={icon}
          onPress={() => onChange(icon)}
          style={[
            styles.iconSlot,
            { borderColor: value === icon ? color : 'transparent', backgroundColor: `${color}22` },
          ]}
        >
          <MedicineIconGlyph icon={icon} color={color} size={20} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  iconSlot: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

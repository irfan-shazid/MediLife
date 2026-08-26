import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import type { MedicineIcon } from '@meditime/shared';

const GLYPHS: Record<MedicineIcon, ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  pill: 'pill',
  capsule: 'bottle-tonic-plus',
  syringe: 'needle',
  drop: 'water',
  heart: 'heart',
  leaf: 'leaf',
};

export function MedicineIconGlyph({
  icon,
  size = 20,
  color,
}: {
  icon: MedicineIcon;
  size?: number;
  color: string;
}) {
  return <MaterialCommunityIcons name={GLYPHS[icon]} size={size} color={color} />;
}

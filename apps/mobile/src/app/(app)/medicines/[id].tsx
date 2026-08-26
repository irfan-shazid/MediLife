import { useState } from 'react';
import { Alert, Switch, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import type { Medicine, MedicineIcon } from '@meditime/shared';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { SkeletonList } from '@/components/ui/skeleton';
import { ColorPicker, IconPicker } from '@/components/color-icon-picker';
import { DayPicker } from '@/components/day-picker';
import { TimeListEditor } from '@/components/time-list-editor';
import { useDeleteMedicine, useMedicine, useUpdateMedicine } from '@/hooks/use-medicines';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

function EditForm({ medicine }: { medicine: Medicine }) {
  const theme = useTheme();
  const [name, setName] = useState(medicine.name);
  const [dosage, setDosage] = useState(medicine.dosage ?? '');
  const [notes, setNotes] = useState(medicine.notes ?? '');
  const [color, setColor] = useState(medicine.color);
  const [icon, setIcon] = useState<MedicineIcon>(medicine.icon);
  const [times, setTimes] = useState<string[]>(medicine.times);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(medicine.daysOfWeek);
  const [isActive, setIsActive] = useState(medicine.isActive);
  const [error, setError] = useState<string | null>(null);

  const updateMedicine = useUpdateMedicine(medicine.id);
  const deleteMedicine = useDeleteMedicine();

  async function onSubmit() {
    setError(null);
    if (!name.trim()) return setError('Give the medicine a name');
    if (times.length === 0) return setError('Add at least one reminder time');

    try {
      await updateMedicine.mutateAsync({
        name,
        dosage,
        notes,
        color,
        icon,
        times,
        daysOfWeek,
        isActive,
      });
      router.back();
    } catch {
      setError('Could not save changes. Please try again.');
    }
  }

  function onDelete() {
    Alert.alert('Delete medicine', `Remove ${medicine.name} and its reminders?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMedicine.mutateAsync(medicine.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <Screen>
      <View style={{ gap: Spacing.md }}>
        <View style={styles.rowBetween}>
          <ThemedText variant="label" color="textSecondary">
            ACTIVE
          </ThemedText>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ true: theme.primary, false: theme.border }}
          />
        </View>

        <TextField label="Medicine name" value={name} onChangeText={setName} />
        <TextField label="Dosage (optional)" value={dosage} onChangeText={setDosage} />

        <View style={{ gap: Spacing.xs }}>
          <ThemedText variant="label" color="textSecondary">
            COLOR
          </ThemedText>
          <ColorPicker value={color} onChange={setColor} />
        </View>

        <View style={{ gap: Spacing.xs }}>
          <ThemedText variant="label" color="textSecondary">
            ICON
          </ThemedText>
          <IconPicker value={icon} onChange={setIcon} color={color} />
        </View>

        <View style={{ gap: Spacing.xs }}>
          <ThemedText variant="label" color="textSecondary">
            REMINDER TIMES
          </ThemedText>
          <TimeListEditor value={times} onChange={setTimes} />
        </View>

        <View style={{ gap: Spacing.xs }}>
          <ThemedText variant="label" color="textSecondary">
            REPEAT ON
          </ThemedText>
          <DayPicker value={daysOfWeek} onChange={setDaysOfWeek} />
        </View>

        <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} multiline />

        {error ? (
          <ThemedText variant="caption" color="danger">
            {error}
          </ThemedText>
        ) : null}

        <Button label="Save changes" onPress={onSubmit} loading={updateMedicine.isPending} />
        <Button
          label="Delete medicine"
          variant="danger"
          onPress={onDelete}
          loading={deleteMedicine.isPending}
        />
      </View>
    </Screen>
  );
}

export default function EditMedicine() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: medicine, isLoading } = useMedicine(id);

  if (isLoading || !medicine) {
    return (
      <Screen>
        <SkeletonList count={4} />
      </Screen>
    );
  }

  return <EditForm medicine={medicine} />;
}

const styles = {
  rowBetween: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
};

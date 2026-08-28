import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { medicineColors, type MedicineIcon } from '@meditime/shared';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { ColorPicker, IconPicker } from '@/components/color-icon-picker';
import { DayPicker } from '@/components/day-picker';
import { TimeListEditor } from '@/components/time-list-editor';
import { SoundPicker } from '@/components/sound-picker';
import { useCreateMedicine } from '@/hooks/use-medicines';
import { Spacing } from '@/constants/theme';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function NewMedicine() {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState<string>(medicineColors[0]);
  const [icon, setIcon] = useState<MedicineIcon>('pill');
  const [times, setTimes] = useState<string[]>([]);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [soundId, setSoundId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createMedicine = useCreateMedicine();

  async function onSubmit() {
    setError(null);
    if (!name.trim()) return setError('Give the medicine a name');
    if (times.length === 0) return setError('Add at least one reminder time');

    try {
      await createMedicine.mutateAsync({
        name,
        dosage,
        notes,
        color,
        icon,
        times,
        daysOfWeek,
        soundId,
        startDate: today(),
        isActive: true,
      });
      router.back();
    } catch {
      setError('Could not save this medicine. Please try again.');
    }
  }

  return (
    <Screen>
      <View style={{ gap: Spacing.md }}>
        <TextField label="Medicine name" value={name} onChangeText={setName} placeholder="e.g. Metformin" />
        <TextField
          label="Dosage (optional)"
          value={dosage}
          onChangeText={setDosage}
          placeholder="e.g. 500mg, 1 tablet"
        />

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

        <TextField
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. take with food"
          multiline
        />

        <View style={{ gap: Spacing.xs }}>
          <ThemedText variant="label" color="textSecondary">
            NOTIFICATION SOUND
          </ThemedText>
          <SoundPicker value={soundId} onChange={setSoundId} />
        </View>

        {error ? (
          <ThemedText variant="caption" color="danger">
            {error}
          </ThemedText>
        ) : null}

        <Button label="Save medicine" onPress={onSubmit} loading={createMedicine.isPending} />
      </View>
    </Screen>
  );
}

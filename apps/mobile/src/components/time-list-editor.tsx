import { useState } from 'react';
import { Platform, Pressable, View, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/constants/theme';

function formatDisplay(time: string) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function TimeListEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (times: string[]) => void;
}) {
  const theme = useTheme();
  const [iosPickerOpen, setIosPickerOpen] = useState(false);
  const [draft, setDraft] = useState(new Date());

  function addTime(date: Date) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const time = `${hh}:${mm}`;
    if (!value.includes(time)) onChange([...value, time].sort());
  }

  function removeTime(time: string) {
    onChange(value.filter((t) => t !== time));
  }

  function openPicker() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: new Date(),
        mode: 'time',
        is24Hour: false,
        onChange: (event, date) => {
          if (event.type === 'set' && date) addTime(date);
        },
      });
    } else {
      setDraft(new Date());
      setIosPickerOpen(true);
    }
  }

  return (
    <View style={{ gap: Spacing.sm }}>
      <View style={styles.row}>
        {value.map((time) => (
          <View key={time} style={[styles.timePill, { backgroundColor: theme.primaryMuted }]}>
            <ThemedText variant="caption" style={{ color: theme.primary, fontWeight: '700' }}>
              {formatDisplay(time)}
            </ThemedText>
            <Pressable onPress={() => removeTime(time)} hitSlop={8}>
              <Ionicons name="close" size={14} color={theme.primary} />
            </Pressable>
          </View>
        ))}
        <Pressable onPress={openPicker} style={[styles.addBtn, { borderColor: theme.primary }]}>
          <Ionicons name="add" size={16} color={theme.primary} />
          <ThemedText variant="caption" style={{ color: theme.primary, fontWeight: '700' }}>
            Add time
          </ThemedText>
        </Pressable>
      </View>

      {Platform.OS === 'ios' && iosPickerOpen && (
        <View style={[styles.iosSheet, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <DateTimePicker
            value={draft}
            mode="time"
            display="spinner"
            onChange={(_, date) => date && setDraft(date)}
          />
          <Pressable
            onPress={() => {
              addTime(draft);
              setIosPickerOpen(false);
            }}
            style={[styles.doneBtn, { backgroundColor: theme.primary }]}
          >
            <ThemedText style={{ color: '#FFFFFF', fontWeight: '700' }}>Done</ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, alignItems: 'center' },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.pill,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  iosSheet: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.sm,
    alignItems: 'stretch',
  },
  doneBtn: {
    marginTop: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
});

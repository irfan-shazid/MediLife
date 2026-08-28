import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MAX_SOUND_FILE_BYTES } from '@meditime/shared';
import type { NotificationSound } from '@meditime/shared';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { PressableScale } from '@/components/ui/pressable-scale';
import { useSounds, useUploadSound } from '@/hooks/use-sounds';
import { usePreviewPlayer } from '@/hooks/use-preview-player';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/constants/theme';

function SoundRow({
  label,
  selected,
  onSelect,
  playing,
  onTogglePlay,
  badge,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  playing?: boolean;
  onTogglePlay?: () => void;
  badge?: string;
}) {
  const theme = useTheme();
  return (
    <PressableScale onPress={onSelect} haptic={false} style={{ width: '100%' }}>
      <Card
        style={[
          styles.row,
          { borderColor: selected ? theme.primary : theme.border, backgroundColor: theme.card },
        ]}
      >
        <Ionicons
          name={selected ? 'radio-button-on' : 'radio-button-off'}
          size={20}
          color={selected ? theme.primary : theme.textMuted}
        />
        <ThemedText variant="body" style={{ flex: 1 }} numberOfLines={1}>
          {label}
        </ThemedText>
        {badge ? (
          <View style={[styles.badge, { backgroundColor: theme.primaryMuted }]}>
            <ThemedText variant="caption" style={{ color: theme.primary, fontWeight: '700' }}>
              {badge}
            </ThemedText>
          </View>
        ) : null}
        {onTogglePlay ? (
          <PressableScale onPress={onTogglePlay} scaleTo={0.85} haptic={false} style={styles.playBtn}>
            <Ionicons name={playing ? 'stop-circle' : 'play-circle'} size={26} color={theme.primary} />
          </PressableScale>
        ) : null}
      </Card>
    </PressableScale>
  );
}

export function SoundPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (soundId: string | null) => void;
}) {
  const theme = useTheme();
  const { data: sounds } = useSounds();
  const uploadSound = useUploadSound();
  const { playingId, toggle } = usePreviewPlayer();
  const [error, setError] = useState<string | null>(null);

  async function pickFile() {
    setError(null);
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
    if (result.canceled) return;

    const file = result.assets[0];
    if (!file) return;
    if (file.size && file.size > MAX_SOUND_FILE_BYTES) {
      setError('That file is larger than 10MB — pick a smaller one.');
      return;
    }

    const formData = new FormData();
    formData.append('name', file.name.replace(/\.[^./]+$/, ''));
    formData.append(
      'file',
      // React Native's fetch/FormData accepts this { uri, name, type } shape
      // for a file part; it isn't a real Blob but TS wants one.
      { uri: file.uri, name: file.name, type: file.mimeType ?? 'audio/mpeg' } as unknown as Blob,
    );

    try {
      const sound = await uploadSound.mutateAsync(formData);
      onChange(sound.id);
    } catch {
      setError('That upload failed — try a different file.');
    }
  }

  return (
    <View style={{ gap: Spacing.sm }}>
      <SoundRow label="Default (system sound)" selected={value === null} onSelect={() => onChange(null)} />
      {sounds?.map((sound) => (
        <SoundRow
          key={sound.id}
          label={sound.name}
          badge={sound.isDefault ? 'Default' : 'Mine'}
          selected={value === sound.id}
          onSelect={() => onChange(sound.id)}
          playing={playingId === sound.id}
          onTogglePlay={() => toggle(sound)}
        />
      ))}

      <PressableScale
        onPress={pickFile}
        haptic={false}
        disabled={uploadSound.isPending}
        style={[styles.upload, { borderColor: theme.primary }]}
      >
        <Ionicons name="cloud-upload-outline" size={18} color={theme.primary} />
        <ThemedText variant="caption" style={{ color: theme.primary, fontWeight: '700' }}>
          {uploadSound.isPending ? 'Uploading…' : 'Upload your own (max 10MB)'}
        </ThemedText>
      </PressableScale>

      {error ? (
        <ThemedText variant="caption" color="danger">
          {error}
        </ThemedText>
      ) : null}

      <ThemedText variant="caption" color="textMuted">
        This sound plays as an in-app alarm while MediTime is open. Background reminders always use
        your device's default notification sound — neither iOS nor Android allows apps to override that.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderWidth: 1.5 },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.pill },
  playBtn: { padding: 2 },
  upload: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});

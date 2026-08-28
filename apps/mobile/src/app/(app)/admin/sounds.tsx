import { useState } from 'react';
import { Alert, FlatList, View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as DocumentPicker from 'expo-document-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MAX_SOUND_FILE_BYTES } from '@meditime/shared';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { PressableScale } from '@/components/ui/pressable-scale';
import { SkeletonList } from '@/components/ui/skeleton';
import { usePreviewPlayer } from '@/hooks/use-preview-player';
import { useDeleteSound, useSounds, useUploadDefaultSound } from '@/hooks/use-sounds';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/constants/theme';

export default function AdminSounds() {
  const theme = useTheme();
  const { data: sounds, isLoading } = useSounds();
  const uploadDefaultSound = useUploadDefaultSound();
  const deleteSound = useDeleteSound();
  const { playingId, toggle } = usePreviewPlayer();
  const [error, setError] = useState<string | null>(null);

  const defaults = sounds?.filter((s) => s.isDefault) ?? [];

  async function pickAndUpload() {
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
    formData.append('file', { uri: file.uri, name: file.name, type: file.mimeType ?? 'audio/mpeg' } as unknown as Blob);

    try {
      await uploadDefaultSound.mutateAsync(formData);
    } catch {
      setError('That upload failed — try a different file.');
    }
  }

  function onDelete(id: string, name: string) {
    Alert.alert(`Remove "${name}"?`, 'Any medicines using it will fall back to the default sound.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteSound.mutateAsync(id) },
    ]);
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <FlatList
        data={defaults}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={{ gap: Spacing.sm, marginBottom: Spacing.md }}>
            <ThemedText variant="body" color="textSecondary">
              These sounds are available to every user when they set up a medicine reminder. They can
              only play as an in-app alarm — see the note on the medicine sound picker.
            </ThemedText>
            <PressableScale
              onPress={pickAndUpload}
              haptic={false}
              disabled={uploadDefaultSound.isPending}
              style={[styles.upload, { borderColor: theme.primary }]}
            >
              <Ionicons name="cloud-upload-outline" size={18} color={theme.primary} />
              <ThemedText variant="caption" style={{ color: theme.primary, fontWeight: '700' }}>
                {uploadDefaultSound.isPending ? 'Uploading…' : 'Add a default sound (max 10MB)'}
              </ThemedText>
            </PressableScale>
            {error ? (
              <ThemedText variant="caption" color="danger">
                {error}
              </ThemedText>
            ) : null}
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListEmptyComponent={
          isLoading ? (
            <SkeletonList count={3} />
          ) : (
            <ThemedText color="textSecondary">No default sounds yet.</ThemedText>
          )
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 30)}>
            <Card style={styles.row}>
              <PressableScale onPress={() => toggle(item)} scaleTo={0.85} haptic={false}>
                <Ionicons
                  name={playingId === item.id ? 'stop-circle' : 'play-circle'}
                  size={28}
                  color={theme.primary}
                />
              </PressableScale>
              <View style={{ flex: 1 }}>
                <ThemedText variant="body">{item.name}</ThemedText>
                <ThemedText variant="caption" color="textMuted">
                  {(item.sizeBytes / 1024 / 1024).toFixed(1)} MB
                </ThemedText>
              </View>
              <PressableScale onPress={() => onDelete(item.id, item.name)} scaleTo={0.85} haptic={false}>
                <Ionicons name="trash-outline" size={20} color={theme.danger} />
              </PressableScale>
            </Card>
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: Spacing.lg, paddingBottom: Spacing.xxl, flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
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

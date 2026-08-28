import { useCallback, useEffect, useRef, useState } from 'react';
import { createAudioPlayer, type AudioPlayer, type AudioStatus } from 'expo-audio';
import type { NotificationSound } from '@meditime/shared';

/** Tap-to-preview playback for a list of sounds — one at a time, imperative
 *  (not the `useAudioPlayer` hook) since the source changes per tap. */
export function usePreviewPlayer() {
  const playerRef = useRef<AudioPlayer | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const stop = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pause();
      playerRef.current.remove();
      playerRef.current = null;
    }
    setPlayingId(null);
  }, []);

  const toggle = useCallback(
    (sound: NotificationSound) => {
      if (playingId === sound.id) {
        stop();
        return;
      }
      stop();
      const player = createAudioPlayer(sound.url);
      const subscription = player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
        if (status.didJustFinish) {
          subscription.remove();
          stop();
        }
      });
      player.play();
      playerRef.current = player;
      setPlayingId(sound.id);
    },
    [playingId, stop],
  );

  useEffect(() => stop, [stop]);

  return { playingId, toggle, stop };
}

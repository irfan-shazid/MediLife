import { useEffect, useMemo, useRef } from 'react';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useGetLogsQuery, useGetMedicinesQuery } from '@/store/api';
import { todaysDoses } from '@/lib/schedule';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

const CHECK_INTERVAL_MS = 30_000;

/**
 * Plays a medicine's chosen sound, looped, as an in-app "alarm" for as long
 * as a dose is due and the app is open. This is the only place a
 * user/admin-uploaded sound can actually play automatically — see the
 * comment on NotificationSound in packages/shared for why the OS-level
 * local notification itself can never use it.
 *
 * Mounted once near the root of the authenticated app so it's active
 * regardless of which tab is showing. Polling medicines/logs app-wide is
 * real background cost, so it only actually happens when at least one
 * active medicine has a sound assigned — otherwise there's nothing this
 * hook could ever do, and it stays fully idle (piggybacking on whatever's
 * already cached from Today/Medicines instead of its own request).
 */
export function useDoseAlarm() {
  const since = useMemo(startOfToday, []);
  const { data: medicines } = useGetMedicinesQuery();
  const hasAlarmableSound = useMemo(
    () => (medicines ?? []).some((m) => m.isActive && m.soundId),
    [medicines],
  );

  const { data: polledMedicines } = useGetMedicinesQuery(undefined, {
    skip: !hasAlarmableSound,
    pollingInterval: CHECK_INTERVAL_MS,
  });
  const { data: logs } = useGetLogsQuery(since, {
    skip: !hasAlarmableSound,
    pollingInterval: CHECK_INTERVAL_MS,
  });
  const playersRef = useRef(new Map<string, AudioPlayer>());

  useEffect(() => {
    if (!hasAlarmableSound) return;

    const doses = todaysDoses(polledMedicines ?? [], logs ?? []);
    const activeKeys = new Set<string>();

    for (const dose of doses) {
      if (dose.status !== 'due' || !dose.medicine.sound) continue;

      const key = `${dose.medicine.id}-${dose.time}`;
      activeKeys.add(key);
      if (!playersRef.current.has(key)) {
        const player = createAudioPlayer(dose.medicine.sound.url);
        player.loop = true;
        player.play();
        playersRef.current.set(key, player);
      }
    }

    for (const [key, player] of playersRef.current) {
      if (!activeKeys.has(key)) {
        player.pause();
        player.remove();
        playersRef.current.delete(key);
      }
    }
  }, [hasAlarmableSound, polledMedicines, logs]);

  // Stop everything if the app/screen tree unmounts (e.g. sign-out).
  useEffect(() => {
    const players = playersRef.current;
    return () => {
      for (const player of players.values()) {
        player.pause();
        player.remove();
      }
      players.clear();
    };
  }, []);
}

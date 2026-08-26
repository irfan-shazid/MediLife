import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Medicine } from '@meditime/shared';

const CHANNEL_ID = 'medicine-reminders';
const ID_SEPARATOR = '__';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationSetup() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Medicine reminders',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;

  const requested = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return requested.status === 'granted';
}

function parseTime(time: string): { hour: number; minute: number } {
  const [hour, minute] = time.split(':').map(Number);
  return { hour, minute };
}

function idPrefix(medicineId: string) {
  return `${medicineId}${ID_SEPARATOR}`;
}

/** Cancels every scheduled notification that belongs to this medicine. */
export async function cancelMedicineNotifications(medicineId: string) {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  const prefix = idPrefix(medicineId);
  const mine = all.filter((n) => n.identifier.startsWith(prefix));
  await Promise.all(mine.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

/** Schedules one local repeating notification per (time, day) the medicine is active for. */
export async function scheduleMedicineNotifications(medicine: Medicine) {
  await cancelMedicineNotifications(medicine.id);
  if (!medicine.isActive) return;

  const granted = await requestNotificationPermission();
  if (!granted) return;

  await ensureNotificationSetup();

  const content = {
    title: `Time for ${medicine.name}`,
    body: medicine.dosage ? `Take ${medicine.dosage}` : 'Tap to mark as taken',
    data: { medicineId: medicine.id },
    ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
  };

  for (const time of medicine.times) {
    const { hour, minute } = parseTime(time);

    if (medicine.daysOfWeek.length === 0) {
      await Notifications.scheduleNotificationAsync({
        identifier: `${idPrefix(medicine.id)}${time}${ID_SEPARATOR}daily`,
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
      continue;
    }

    for (const dow of medicine.daysOfWeek) {
      await Notifications.scheduleNotificationAsync({
        identifier: `${idPrefix(medicine.id)}${time}${ID_SEPARATOR}${dow}`,
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: dow + 1, // expo-notifications: Sunday = 1 ... Saturday = 7
          hour,
          minute,
        },
      });
    }
  }
}

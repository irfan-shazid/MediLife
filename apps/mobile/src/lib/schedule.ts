import { isDayActive, type LogStatus, type Medicine, type MedicineLog } from '@meditime/shared';

export type DoseStatus = LogStatus | 'due' | 'upcoming';

export interface DoseOccurrence {
  medicine: Medicine;
  time: string; // "HH:mm"
  scheduledFor: string; // ISO datetime, today
  status: DoseStatus;
  log?: MedicineLog;
}

function sameMinute(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate() &&
    a.getHours() === b.getHours() &&
    a.getMinutes() === b.getMinutes()
  );
}

export function todaysDoses(
  medicines: Medicine[],
  logs: MedicineLog[],
  now = new Date(),
): DoseOccurrence[] {
  const dow = now.getDay();
  const todayStr = now.toISOString().slice(0, 10);
  const occurrences: DoseOccurrence[] = [];

  for (const medicine of medicines) {
    if (!medicine.isActive) continue;
    if (medicine.startDate > todayStr) continue;
    if (medicine.endDate && medicine.endDate < todayStr) continue;
    if (!isDayActive(medicine.daysOfWeek, dow)) continue;

    for (const time of medicine.times) {
      const [hour, minute] = time.split(':').map(Number);
      const scheduled = new Date(now);
      scheduled.setHours(hour, minute, 0, 0);

      const log = logs.find(
        (l) => l.medicineId === medicine.id && sameMinute(new Date(l.scheduledFor), scheduled),
      );

      let status: DoseStatus;
      if (log) status = log.status;
      else status = scheduled.getTime() > now.getTime() ? 'upcoming' : 'due';

      occurrences.push({ medicine, time, scheduledFor: scheduled.toISOString(), status, log });
    }
  }

  return occurrences.sort((a, b) => a.time.localeCompare(b.time));
}

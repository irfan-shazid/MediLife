import { z } from "zod";

export const ROLES = ["user", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const LOG_STATUSES = ["taken", "missed", "skipped"] as const;
export type LogStatus = (typeof LOG_STATUSES)[number];

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// "HH:mm", 24-hour, zero-padded
export const timeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format");

export const dayOfWeekSchema = z.number().int().min(0).max(6);

export const medicineColors = [
  "#5DBFA0", // mint
  "#F2A65A", // warm amber
  "#7C8CF8", // periwinkle
  "#F27C7C", // coral
  "#68B4E3", // sky
  "#C79FF2", // lilac
] as const;

export const medicineIcons = ["pill", "capsule", "syringe", "drop", "heart", "leaf"] as const;
export type MedicineIcon = (typeof medicineIcons)[number];

export const createMedicineSchema = z.object({
  name: z.string().trim().min(1, "Medicine name is required").max(100),
  dosage: z.string().trim().max(100).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  color: z.string().default(medicineColors[0]),
  icon: z.enum(medicineIcons).default("pill"),
  times: z.array(timeStringSchema).min(1, "Add at least one reminder time").max(12),
  daysOfWeek: z.array(dayOfWeekSchema).max(7).default([]), // [] = every day
  startDate: z.string().date(),
  endDate: z.string().date().optional().nullable(),
  isActive: z.boolean().default(true),
  soundId: z.string().uuid().nullable().optional(),
});
export type CreateMedicineInput = z.infer<typeof createMedicineSchema>;

export const updateMedicineSchema = createMedicineSchema.partial();
export type UpdateMedicineInput = z.infer<typeof updateMedicineSchema>;

// ---------------------------------------------------------------------------
// Notification sounds
//
// Neither iOS nor Android will play a file uploaded/downloaded at runtime as
// the actual OS notification sound — both require sound files bundled into
// the app binary at build time. So a chosen sound here plays as an in-app
// "alarm" (looped, via expo-audio) whenever the app is open at/after a due
// dose's time; the OS-level local notification always uses the platform
// default sound, which is what actually fires in the background.
// ---------------------------------------------------------------------------

export const MAX_SOUND_FILE_BYTES = 10 * 1024 * 1024; // 10MB

export const ALLOWED_SOUND_MIME_TYPES = [
  "audio/mpeg", // .mp3
  "audio/mp4", // .m4a
  "audio/x-m4a",
  "audio/aac",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
] as const;

export const uploadSoundSchema = z.object({
  name: z.string().trim().min(1, "Give the sound a name").max(80),
});
export type UploadSoundInput = z.infer<typeof uploadSoundSchema>;

export interface NotificationSound {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  isDefault: boolean;
  uploadedBy: string | null;
  createdAt: string;
}

export interface Medicine {
  id: string;
  userId: string;
  name: string;
  dosage: string | null;
  notes: string | null;
  color: string;
  icon: MedicineIcon;
  times: string[];
  daysOfWeek: number[];
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  soundId: string | null;
  sound: NotificationSound | null;
  createdAt: string;
  updatedAt: string;
}

export const createLogSchema = z.object({
  medicineId: z.string().uuid(),
  scheduledFor: z.string().datetime(),
  status: z.enum(LOG_STATUSES),
});
export type CreateLogInput = z.infer<typeof createLogSchema>;

export interface MedicineLog {
  id: string;
  medicineId: string;
  userId: string;
  scheduledFor: string;
  status: LogStatus;
  respondedAt: string | null;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  newUsersLast7Days: number;
  totalMedicines: number;
  activeMedicines: number;
  adherenceRate: number; // 0-1
  totalDosesLogged: number;
}

export function isDayActive(daysOfWeek: number[], dow: number): boolean {
  return daysOfWeek.length === 0 || daysOfWeek.includes(dow);
}

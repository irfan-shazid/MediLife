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
});
export type CreateMedicineInput = z.infer<typeof createMedicineSchema>;

export const updateMedicineSchema = createMedicineSchema.partial();
export type UpdateMedicineInput = z.infer<typeof updateMedicineSchema>;

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

import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { ALLOWED_SOUND_MIME_TYPES, MAX_SOUND_FILE_BYTES } from "@meditime/shared";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// apps/api/uploads/sounds — gitignored; see README for the production caveat
// (a single local disk doesn't survive most host redeploys/scale-outs, so a
// real deployment should swap this for object storage like S3/R2).
export const SOUNDS_DIR = path.join(__dirname, "..", "..", "uploads", "sounds");
fs.mkdirSync(SOUNDS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, SOUNDS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).slice(0, 10);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const uploadSound = multer({
  storage,
  limits: { fileSize: MAX_SOUND_FILE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_SOUND_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_SOUND_MIME_TYPES)[number])) {
      cb(new Error("Unsupported audio format"));
      return;
    }
    cb(null, true);
  },
}).single("file");

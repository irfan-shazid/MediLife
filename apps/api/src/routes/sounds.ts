import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { uploadSoundSchema } from "@meditime/shared";
import { prisma } from "../db/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/requireAuth.js";
import { SOUNDS_DIR, uploadSound } from "../lib/uploads.js";
import type { NotificationSound as PrismaSound } from "@prisma/client";
import type { Request, Response } from "express";

export const soundsRouter = Router();

soundsRouter.use(requireAuth);

function toDTO(req: Request, sound: PrismaSound) {
  const base = `${req.protocol}://${req.get("host")}`;
  return {
    id: sound.id,
    name: sound.name,
    url: `${base}/uploads/sounds/${sound.fileName}`,
    mimeType: sound.mimeType,
    sizeBytes: sound.sizeBytes,
    isDefault: sound.isDefault,
    uploadedBy: sound.uploadedBy,
    createdAt: sound.createdAt,
  };
}

// Every admin-provided default, plus the signed-in user's own uploads.
soundsRouter.get("/", async (req, res) => {
  const rows = await prisma.notificationSound.findMany({
    where: { OR: [{ isDefault: true }, { uploadedBy: req.user!.id }] },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  res.json(rows.map((r) => toDTO(req, r)));
});

function handleUpload(isDefault: boolean) {
  return (req: Request, res: Response) => {
    uploadSound(req, res, async (err: unknown) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(413).json({ error: "Audio file must be 10MB or smaller" });
          return;
        }
        res.status(400).json({ error: err.message });
        return;
      }
      if (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : "Upload failed" });
        return;
      }
      if (!req.file) {
        res.status(400).json({ error: "No audio file provided" });
        return;
      }

      const parsed = uploadSoundSchema.safeParse({ name: req.body?.name || req.file.originalname });
      if (!parsed.success) {
        fs.unlink(req.file.path, () => {});
        res.status(400).json({ error: parsed.error.flatten() });
        return;
      }

      const sound = await prisma.notificationSound.create({
        data: {
          name: parsed.data.name,
          fileName: path.basename(req.file.path),
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
          isDefault,
          uploadedBy: req.user!.id,
        },
      });

      res.status(201).json(toDTO(req, sound));
    });
  };
}

// A user's own custom sound (max 10MB, enforced in lib/uploads.ts).
soundsRouter.post("/", handleUpload(false));

// Admin-provided default, visible to every user.
soundsRouter.post("/default", requireAdmin, handleUpload(true));

// Owner can delete their own upload; an admin can delete any sound
// (including defaults). Medicines referencing it just fall back to the
// platform default sound (soundId set to null via onDelete: SetNull).
soundsRouter.delete("/:id", async (req, res) => {
  const sound = await prisma.notificationSound.findUnique({ where: { id: req.params.id } });
  if (!sound) {
    res.status(404).json({ error: "Sound not found" });
    return;
  }
  if (sound.uploadedBy !== req.user!.id && req.user!.role !== "admin") {
    res.status(403).json({ error: "Not allowed to delete this sound" });
    return;
  }

  await prisma.notificationSound.delete({ where: { id: req.params.id } });
  fs.unlink(path.join(SOUNDS_DIR, sound.fileName), () => {});
  res.status(204).send();
});

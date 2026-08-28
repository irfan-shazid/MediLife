-- AlterTable
ALTER TABLE "medicines" ADD COLUMN     "sound_id" TEXT;

-- CreateTable
CREATE TABLE "notification_sounds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_sounds_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "medicines" ADD CONSTRAINT "medicines_sound_id_fkey" FOREIGN KEY ("sound_id") REFERENCES "notification_sounds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_sounds" ADD CONSTRAINT "notification_sounds_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

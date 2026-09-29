UPDATE "User"
SET "username" = md5("id")
WHERE "username" IS NULL;

ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

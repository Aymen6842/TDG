-- Fix ProjectContent.language column to use Language enum instead of text
ALTER TABLE "ProjectContent" ALTER COLUMN "language" DROP DEFAULT;
ALTER TABLE "ProjectContent" ALTER COLUMN "language" TYPE "Language" USING "language"::"Language";
ALTER TABLE "ProjectContent" ALTER COLUMN "language" SET DEFAULT 'English'::"Language";

-- Fix SprintContent.language
ALTER TABLE "SprintContent" ALTER COLUMN "language" DROP DEFAULT;
ALTER TABLE "SprintContent" ALTER COLUMN "language" TYPE "Language" USING "language"::"Language";
ALTER TABLE "SprintContent" ALTER COLUMN "language" SET DEFAULT 'English'::"Language";

-- Fix TaskContent.language
ALTER TABLE "TaskContent" ALTER COLUMN "language" DROP DEFAULT;
ALTER TABLE "TaskContent" ALTER COLUMN "language" TYPE "Language" USING "language"::"Language";
ALTER TABLE "TaskContent" ALTER COLUMN "language" SET DEFAULT 'English'::"Language";

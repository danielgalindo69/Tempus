CREATE TYPE "TaskPriority" AS ENUM ('low', 'medium', 'high');

ALTER TABLE "tasks"
ADD COLUMN "priority" "TaskPriority" NOT NULL DEFAULT 'medium';

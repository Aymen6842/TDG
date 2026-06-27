-- Add cost tracking fields to Project table
ALTER TABLE "Project" ADD COLUMN "estimatedBudget" DECIMAL(10,2);
ALTER TABLE "Project" ADD COLUMN "hourlyRate" DECIMAL(10,2);

-- Add hourly rate to ProjectMember table
ALTER TABLE "ProjectMember" ADD COLUMN "hourlyRate" DECIMAL(10,2);

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('local', 'kakao', 'google');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "provider" "AuthProvider" NOT NULL DEFAULT 'local';

/*
  Warnings:

  - You are about to drop the column `token` on the `EmailAuth` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[authCode]` on the table `EmailAuth` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `authCode` to the `EmailAuth` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "EmailAuth_token_key";

-- AlterTable
ALTER TABLE "EmailAuth" DROP COLUMN "token",
ADD COLUMN     "authCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EmailAuth_authCode_key" ON "EmailAuth"("authCode");

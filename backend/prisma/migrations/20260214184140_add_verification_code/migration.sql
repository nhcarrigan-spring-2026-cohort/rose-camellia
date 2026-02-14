/*
  Warnings:

  - A unique constraint covering the columns `[verificationCode]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorUsername_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "verificationCode" TEXT,
ALTER COLUMN "authorUsername" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Post_verificationCode_key" ON "Post"("verificationCode");

-- CreateIndex
CREATE INDEX "Post_verificationCode_idx" ON "Post"("verificationCode");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorUsername_fkey" FOREIGN KEY ("authorUsername") REFERENCES "User"("username") ON DELETE SET NULL ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_userId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_interviewId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_userId_fkey";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "Interview";

-- DropTable
DROP TABLE "Question";

-- DropEnum
DROP TYPE "QuestionType";


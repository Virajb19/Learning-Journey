-- DropForeignKey
ALTER TABLE "Chapter" DROP CONSTRAINT "Chapter_unitId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_chapterId_fkey";

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

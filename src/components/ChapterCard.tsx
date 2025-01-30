import { Chapter } from "@prisma/client"

type Props = {
  chapterIdx: number
  chapter: Pick<Chapter, "id" | "name" | "unitId">
}

export default function ChapterCard({ chapterIdx, chapter } : Props) {
  return <div className="chapters flex items-center justify-between p-2 bg-green-600 rounded-md">
          <h3 className="text-lg font-bold">Chapter {chapterIdx + 1} {chapter.name}</h3>
  </div>
}
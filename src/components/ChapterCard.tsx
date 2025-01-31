import { Chapter } from "@prisma/client"
import { useCallback } from "react"

type Props = {
  chapterIdx: number
  chapter: Pick<Chapter, "id" | "name" | "unitId">,
  completedChapters: Set<string>,
  setCompletedChapters: React.Dispatch<React.SetStateAction<Set<string>>>
}

export default function ChapterCard({ chapterIdx, chapter, completedChapters, setCompletedChapters } : Props) {

  const addChapterIdToSet = useCallback(() => {
     setCompletedChapters(prev => {
        const newSet = new Set(prev)
        newSet.add(chapter.id)
        return newSet
     })
  }, [chapter.id, setCompletedChapters])

  return <div className="chapters flex items-center justify-between p-2 bg-white/10 rounded-md">
          <h3 className="text-lg font-bold">Chapter {chapterIdx + 1} {chapter.name}</h3>
  </div>
}
import { Chapter } from "@prisma/client"
import { Loader2 } from "lucide-react"
import { useCallback, useEffect, useState, forwardRef, useImperativeHandle } from "react"
import { twMerge } from "tailwind-merge"
import { api } from "~/trpc/react"

type Props = {
  chapterIdx: number
  chapter: Pick<Chapter, "id" | "name" | "unitId" | "videoId">,
  completedChapters: Set<string>,
  setCompletedChapters: React.Dispatch<React.SetStateAction<Set<string>>>
}

export type ChapterRef = {
  createChapter: () => Promise<void>
}

export const ChapterCard = forwardRef<ChapterRef,Props>(({ chapterIdx, chapter, completedChapters, setCompletedChapters}, ref) => {

    const [success, setSuccess] = useState<boolean | null>(null)

    const createChapter = api.chapters.create.useMutation({
        onSuccess: () => {
          setSuccess(true)
          addChapterIdToSet()
        },
        onError: (err) => {
          console.error(err)
          setSuccess(false)
          // toast.error(err.message)
        }
      })
      
  const addChapterIdToSet = useCallback(() => {
      setCompletedChapters(prev => {
            const newSet = new Set(prev)
            newSet.add(chapter.id)
            return newSet
        })
   }, [chapter.id, setCompletedChapters])

  useEffect(() => {
        if(chapter.videoId) {
          setSuccess(true)
          addChapterIdToSet()
        }
    }, [chapter,addChapterIdToSet])

    useImperativeHandle(ref, () => ({
      async createChapter() {
         if(chapter.videoId) {
            addChapterIdToSet()
            return
         }
         await createChapter.mutateAsync({ chapterId: chapter.id})
      },
    }))

  // onClick={() => createChapter.mutate({ chapterId: chapter.id})} disabled={createChapter.isPending || success === true} 

 return <div className={twMerge("chapters flex items-center justify-between p-2 bg-secondary dark:bg-white/10 rounded-md", createChapter.isPending && 'opacity-70', 
          success === true && 'bg-green-500 dark:bg-green-600', 
          success === false && 'bg-red-500 dark:bg-red-600'
        )}>
            <h3 className="text-lg font-bold text-wrap">Chapter {chapterIdx + 1} {chapter.name}</h3>
            {createChapter.isPending && <Loader2 className="animate-spin"/>}
  </div>
}) 

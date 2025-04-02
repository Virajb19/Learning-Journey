'use client'

import { Chapter, Course, Unit } from "@prisma/client"
import { ChapterCard, ChapterRef } from "./ChapterCard"
import { ChevronRight, ChevronLeft} from 'lucide-react'
import Link from "next/link"
import { useMemo, useState, RefObject, createRef } from "react"
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { api } from "~/trpc/react"

type Props = {
    course: Course & {
        units: (Unit & {
            chapters: Pick<Chapter, "id" | "name" | "unitId" | "videoId"> []
        }) []
    }
}

export default function ConfirmChapters({ course }: Props) {

  const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set())
  const [isGenerating, setIsGenerating] = useState(false)

  const router = useRouter()

  const totalChapters = useMemo(() => {
     return course.units.reduce((acc, unit) => {
         return acc + unit.chapters.length
      }, 0)
  }, [course.units])

  const chapterRefs = useMemo(() => {
     const refs: Record<string, RefObject<ChapterRef>> = {}
     course.units.forEach(unit => {
        unit.chapters.forEach(chapter => {
            refs[chapter.id] = createRef()
        })
     })
     return refs
  }, [course.units])

  async function handleGenerate() {
    // setIsGenerating(true)
    // const buttons = Array.from(document.querySelectorAll('.chapters')) as HTMLButtonElement[]
    // await Promise.allSettled(buttons.map(button => button.click()))

    // Object.values(chapterRefs).forEach(ref => {
        //     ref.current?.createChapter()
        // })

    setIsGenerating(true)
    const chapters = Object.values(chapterRefs)
    await Promise.allSettled(chapters.map(async (chapter) => {
        await chapter.current?.createChapter()
    }))
    setIsGenerating(false)
    if(totalChapters !== completedChapters.size) toast.error('Try again!!!')
    router.refresh()
  }

  const createQuestions = api.chapters.createQuestions.useMutation({
    onSuccess: () => {
       router.push(`/course/${course.id}/0/0`)
    },
    onError: (err) => {
       console.error(err)
       toast.error(err.message)
    }
  })


  return <div className="flex flex-col gap-2">
         {course.units.map((unit, i) => {

             const chapters = unit.chapters

            return <div key={unit.id} className="flex flex-col gap-2 mt-2">
                   <h3 className="text-secondary-foreground/60 text-xl font-semibold uppercase">Unit {i + 1}</h3>
                   <h1 className="text-3xl font-extrabold">{unit.name}</h1>
                   <div className="flex flex-col gap-2">
                      {chapters.map((chapter, i) => {
                        return <ChapterCard key={chapter.id} ref={chapterRefs[chapter.id]} chapterIdx={i} chapter={chapter} completedChapters={completedChapters} setCompletedChapters={setCompletedChapters}/>
                      })}
                   </div>
            </div>
         })}

         <div className="flex items-center gap-2 mt-4">
             <div className="grow bg-secondary-foreground/60 h-px"/>
             <Link href={'/create'} className="px-3 py-2 group bg-blue-100 dark:bg-white/10 flex-center gap-2 rounded-md font-semibold">
                  <ChevronLeft className="group-hover:-translate-x-1 duration-200"/> Back
             </Link>

             {/* {totalChapters === completedChapters.size ? (
                <Link href={`/course/${course.id}/0/0`} className="button-style group px-3 py-2 flex-center gap-2 rounded-md font-semibold">
                   Save and Continue <ChevronRight className="group-hover:translate-x-1 duration-200"/>
                </Link>
             ) : ( */}
             {/* disabled={isGenerating} onClick={handleGenerate} */}
                <button disabled={createQuestions.isPending} onClick={() => createQuestions.mutate({courseId: course.id})}  className="button-style group px-3 py-2 flex-center gap-2 rounded-md font-semibold disabled:animate-pulse disabled:cursor-not-allowed disabled:opacity-70">
                  {createQuestions.isPending ? (
                      <>
                          Generating...
                      </>
                  ) : (
                     <>
                        Generate <ChevronRight className="group-hover:translate-x-1 duration-200"/>                     
                     </>
                  )}
              </button>
             {/* )} */}
             <div className="grow bg-secondary-foreground/60 h-px"/>
         </div>
  </div>
}
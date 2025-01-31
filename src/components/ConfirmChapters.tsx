'use client'

import { Chapter, Course, Unit } from "@prisma/client"
import ChapterCard from "./ChapterCard"
import { ChevronRight, ChevronLeft} from 'lucide-react'
import Link from "next/link"
import { useMemo, useState } from "react"

type Props = {
    course: Course & {
        units: (Unit & {
            chapters: Pick<Chapter, "id" | "name" | "unitId"> []
        }) []
    }
}

export default function ConfirmChapters({ course }: Props) {

  const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set())

  const totalChapters = useMemo(() => {
     return course.units.reduce((acc, unit) => {
         return acc + unit.chapters.length
      }, 0)
  }, [course.units])

  return <div className="flex flex-col gap-2">
         {course.units.map((unit, i) => {

             const chapters = unit.chapters

            return <div key={unit.id} className="flex flex-col gap-2 mt-2">
                   <h3 className="text-secondary-foreground/60 text-xl font-semibold uppercase">Unit {i + 1}</h3>
                   <h1 className="text-3xl font-extrabold">{unit.name}</h1>
                   <div className="flex flex-col gap-2">
                      {chapters.map((chapter, i) => {
                        return <ChapterCard key={chapter.id} chapterIdx={i} chapter={chapter} completedChapters={completedChapters} setCompletedChapters={setCompletedChapters}/>
                      })}
                   </div>
            </div>
         })}

         <div className="flex items-center gap-2 mt-4">
             <div className="grow bg-secondary-foreground/60 h-px"/>
             <Link href={'/create'} className="px-3 py-2 group bg-blue-100 dark:bg-white/10 flex-center gap-2 rounded-md font-semibold">
                  <ChevronLeft className="group-hover:-translate-x-1 duration-200"/> Back
             </Link>

             {totalChapters === completedChapters.size ? (
                <Link href={`/course/${course.id}`} className="button-style group px-3 py-2 flex-center gap-2 rounded-md font-semibold">
                   Save and Continue <ChevronRight className="group-hover:translate-x-1 duration-200"/>
                </Link>
             ) : (
                <button className="button-style group px-3 py-2 flex-center gap-2 rounded-md font-semibold">
                   Generate <ChevronRight className="group-hover:translate-x-1 duration-200"/>
              </button>
             )}
             <div className="grow bg-secondary-foreground/60 h-px"/>
         </div>
  </div>
}
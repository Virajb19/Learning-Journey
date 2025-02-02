'use client'

import { Chapter, Course, Question, Unit } from "@prisma/client"
import Link from "next/link"
import { Fragment, useEffect } from "react"
import { twMerge } from "tailwind-merge"

type Props = {
    course: Course & { units: (Unit & { chapters: (Chapter & { questions: Question[]}) [] }) []},
    currentChapterId: string
}

export default function CourseSidebar({ course, currentChapterId } : Props) {

    useEffect(() => {
        const currentChapter = document.querySelector('.links.text-green-500')
        if(currentChapter) {
            currentChapter.scrollIntoView({ behavior: 'smooth', block: 'center'})
        }
    }, [currentChapterId])

  return <div className="flex flex-col gap-2 w-1/4 h-[calc(90vh-3rem)] p-3 overflow-auto rounded-r-3xl bg-secondary dark:bg-white/5">
        <h2 className="font-bold border-b-[3px] border-gray-400">{course.name}</h2>
        <div className="flex flex-col gap-2 max-h-[90%] overflow-y-scroll">
            {course.units.map((unit, unitIdx) => {
                const chapters = unit.chapters
                return <Fragment key={unit.id}>
                  <div className="flex flex-col gap-1 border-b border-gray-400">
                       <h3 className="uppercase text-lg font-semibold">Unit {unitIdx + 1} </h3>
                       <h2 className="text-3xl font-bold">{unit.name}</h2>
                      {chapters.map((chapter, chapterIdx) => {
                         return <Link key={chapter.id} href={`/course/${course.id}/${unitIdx}/${chapterIdx}`}
                            className={twMerge("links text-secondary-foreground/60 truncate text-lg font-semibold", chapter.id === currentChapterId && 'text-green-500')}>
                              {chapter.name}
                         </Link>
                      })}
                </div>
               {/* <div className="h-px bg-gray-400 w-full"/> */}
            </Fragment>
            })}  
          </div>
  </div>
}
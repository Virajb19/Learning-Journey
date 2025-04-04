'use client'

import { Chapter, Course, Unit } from "@prisma/client"
import { useRouter } from "nextjs-toploader/app"
import { createRef, RefObject, useMemo, useState } from "react"
import { UnitCard, UnitRef } from "./UnitCard"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useLocalStorage } from 'usehooks-ts'

type Props = {
    course: Course & {
        units: (Unit & {
            chapters: Pick<Chapter, "id" | "name" | "unitId" | "videoId"> []
        }) []
    }
}

export default function ConfirmUnits({course}: Props) {

    // useLocalStorage
    const [completedUnits, setCompletedUnits] = useState<Set<string>>(new Set())
    const [isGenerating, setIsGenerating] = useState(false)

    const router = useRouter()

    const totalUnits = useMemo(() => {
        return course.units.length
    }, [course.units])

    const unitRefs = useMemo(() => {
        const refs: Record<string, RefObject<UnitRef>> = {}
        course.units.forEach(unit => {
            refs[unit.id] = createRef()
        })
        return refs
     }, [course.units])

    async function handleGenerate() {
        setIsGenerating(true)
        const units = Object.values(unitRefs)
        await Promise.allSettled(units.map(async unit => {
             await unit.current?.createUnitQuestions()
        }))
        setIsGenerating(false)
        // await new Promise(r => setTimeout(r, 2000))
        // if(totalUnits !== completedUnits.size) toast.error('Try again!!!')
        // router.refresh()
    }

  return <div className="flex flex-col gap-2">
        {course.units.map((unit,i) => {
            return <UnitCard ref={unitRefs[unit.id]} key={unit.id} unit={unit} unitIdx={i} completedUnits={completedUnits} setCompletedUnits={setCompletedUnits}/>
        })}

<div className="flex items-center gap-2 mt-4">
             <div className="grow bg-secondary-foreground/60 h-px"/>
             <Link href={'/create'} className="px-3 py-2 group bg-blue-100 dark:bg-white/10 flex-center gap-2 rounded-md font-semibold">
                  <ChevronLeft className="group-hover:-translate-x-1 duration-200"/> Back
             </Link>

             {totalUnits === completedUnits.size ? (
                <Link href={`/course/${course.id}/0/0`} className="button-style group px-3 py-2 flex-center gap-2 rounded-md font-semibold">
                   Save and Continue <ChevronRight className="group-hover:translate-x-1 duration-200"/>
                </Link>
             ) : (
                <button disabled={isGenerating} onClick={handleGenerate} className="button-style group px-3 py-2 flex-center gap-2 rounded-md font-semibold dark:disabled:animate-pulse disabled:cursor-not-allowed disabled:opacity-70">
                  {isGenerating ? (
                      <>
                        <div className="size-5 border-[3px] border-white/30 dark:border-black rounded-full animate-spin border-t-white dark:border-t-white"/> Generating...
                      </>
                  ) : (
                     <>
                        Generate <ChevronRight className="group-hover:translate-x-1 duration-200"/>                     
                     </>
                  )}
              </button>
             )}
             <div className="grow bg-secondary-foreground/60 h-px"/>
         </div>
  </div>
}
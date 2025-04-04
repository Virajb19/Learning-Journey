import { Chapter, Unit } from "@prisma/client"
import { Loader2 } from "lucide-react"
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"
import { useLocalStorage } from "usehooks-ts"
import { api } from "~/trpc/react"

type Props = {
    unit: Pick<Unit, "id" | "courseId" | "name"> & {
        chapters: (Pick<Chapter, "id" | "name" | "unitId" | "videoId">) []
    },
    unitIdx: number,
    completedUnits: Set<string>,
    setCompletedUnits: React.Dispatch<React.SetStateAction<Set<string>>>
}

export type UnitRef = {
    createUnitQuestions: () => Promise<void>
}

export const UnitCard = forwardRef<UnitRef,Props>(({unit,unitIdx,completedUnits,setCompletedUnits}, ref) => {
  
    // unit.chapters.every(c => !!c.videoId) Initial value
    // const [success, setSuccess] = useLocalStorage<boolean | null>(`unit-status-${unit.id}`, null)
    const [success, setSuccess] = useState<boolean | null>(null)

    const createQuestions = api.unit.createQuestions.useMutation({
      onSuccess: () => {
         setSuccess(true)
         setCompletedUnits(prev => new Set(prev).add(unit.id)) 
      },
      onError: (err) => {
          setSuccess(false)
          console.error(err)
          toast.error(err.message)
      }
    })

    const chapters = unit.chapters
  
    // const addUnitIdToSet = useCallback(() => {
    //      setCompletedUnits(prev => {
    //         const newSet = new Set(prev)
    //         newSet.add(unit.id)
    //         return newSet
    //      })
    // }, [unit.id, setCompletedUnits])

    useEffect(() => {
        if(unit.chapters.every(c => c.videoId)) {
            setSuccess(true)
            setCompletedUnits(prev => new Set(prev).add(unit.id))
        }
    }, [unit,setCompletedUnits])

    useImperativeHandle(ref, () => ({
        async createUnitQuestions() {
            if(completedUnits.has(unit.id)) return
            await createQuestions.mutateAsync({unitId: unit.id})
           }       
    }))
 
    return <div className="flex flex-col gap-2 mt-2">
            <h3 className="text-secondary-foreground/60 text-xl font-semibold uppercase">Unit {unitIdx + 1}</h3>
            <h1 className="text-3xl font-extrabold">{unit.name}</h1>
            <div className="flex flex-col gap-2">
          {chapters.map((chapter, i) => {
             return <div className={twMerge("chapters flex items-center justify-between p-2 bg-secondary dark:bg-white/10 rounded-md", createQuestions.isPending && 'opacity-70', 
                    success === true && 'bg-green-500 dark:bg-green-600', 
                    success === false && 'bg-red-500 dark:bg-red-600'
                )}>
                  <h3 className="text-lg font-bold text-wrap">Chapter {i + 1} {chapter.name}</h3>
                  {createQuestions.isPending && <Loader2 className="animate-spin"/>}
        </div>
        })}
    </div>
</div>
})
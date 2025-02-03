'use client'

import { Chapter, Course, Unit } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Check } from 'lucide-react';
import { twMerge } from "tailwind-merge";
import { api } from "~/trpc/react";
import { useRouter } from 'next/navigation'
import { useLocalStorage } from 'usehooks-ts'

type Props = { course : Course & { units: (Unit & { chapters: Chapter[]})[]}}

export default function CourseCard({ course }: Props) {

//  const [checked, setChecked] = useLocalStorage<boolean>(`${course.id}-checked`, false)
const [isCompleted, setIsCompleted] = useState(course.isCompleted)

  const toggleCompletion = api.course.toggleCompletion.useMutation({
    onMutate: () => {
        setIsCompleted(prev => !prev)
    },
    onError: (err) => {
        console.error(err)
        setIsCompleted(prev => !prev)
    },
    onSettled: () => {
        router.refresh()
    }
  })

  const router = useRouter()

  const totalChapters = useMemo(() => {
     return course.units.reduce((acc,unit) => {
         return acc + unit.chapters.length
     }, 0)
  }, [course.units])

// const isCompleted = course.isCompleted
// disabled={toggleCompletion.isPending} 

  return <div className="flex flex-col gap-2 border rounded-lg border-secondary">
         <Link href={`/course/${course.id}/0/0`} className="relative">
           <Image src={course.image} alt="picture" width={300} height={300} className="object-cover rounded-t-lg"/>
           <span className="absolute bottom-2 left-2 font-semibold text-lg p-2 rounded-md bg-black/60">{course.name}</span>
         </Link>
         <div className="flex flex-col gap-2 p-3">
            <div className="flex items-center justify-between">
               <h4 className="text-secondary-foreground/60 font-semibold text-xl">Units</h4>
               <button onClick={() => toggleCompletion.mutate({ courseId: course.id})} className={twMerge("size-5 border-2 border-gray-400 rounded-sm flex-center", isCompleted && 'bg-white border-transparent')}>
                   {isCompleted && <Check className="text-[#1f1e20]" strokeWidth={3}/>}
               </button>
            </div>
             {course.units.map((unit,unitIdx) => {
                return <Link key={unit.id} href={`/course/${course.id}/${unitIdx}/0`} className="flex items-center font-semibold underline text-lg">
                     Unit {unitIdx + 1} : {unit.name}
                </Link>
             })}
         </div>
         <div className="flex items-center justify-between p-2 text-sm">
             <div className="flex items-center gap-1 font-semibold p-2 bg-white/10 rounded-md">
                <BookOpen className="size-5"/> {totalChapters} Chapters
             </div>
             <span className="p-2 bg-white/10 rounded-md">{course.level}</span>
         </div>
  </div>
}
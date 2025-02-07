'use client'

import { Chapter, Course, Unit } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Check, Trash2 } from 'lucide-react';
import { twMerge } from "tailwind-merge";
import { api } from "~/trpc/react";
import { useRouter } from 'next/navigation'
import { useLocalStorage } from 'usehooks-ts'
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";

type Props = { course : Course & { units: (Unit & { chapters: Pick<Chapter, 'id'> []})[]}}

export default function CourseCard({ course }: Props) {

//  const [checked, setChecked] = useLocalStorage<boolean>(`${course.id}-checked`, false)
// const utils = api.useUtils()
// const { data: isCompleted, isLoading} = api.course.isCompleted.useQuery({ courseId: course.id})
// const [data] = api.course.isCompleted.useSuspenseQuery({ courseId: course.id})

const { data: session, status} = useSession()
const isPro = session?.user.isPro

const [open, setOpen] = useState(false)

const deleteCourse = api.course.delete.useMutation({
  onSuccess: () => {
      toast.success('deleted', { position: 'bottom-right'})
  },
  onError: (err) => {
    console.error(err)
    toast.error(err.message)
  },
  onSettled: () => {
     router.refresh()
    //  utils.user.getCourses.refetch()
  }
})

const [isCompleted, setIsCompleted] = useState(course.isCompleted)

  const toggleCompletion = api.course.toggleCompletion.useMutation({
    onMutate: () => {
        setIsCompleted(prev => !prev)
        // utils.course.isCompleted.cancel()
        // const toggle = utils.course.isCompleted.getData({ courseId: course.id})
        // utils.course.isCompleted.setData({courseId: course.id}, (toggle) => (!toggle))
        // return toggle
    },
    onError: (err, {courseId}, prevToggle) => {
        console.error(err)
        setIsCompleted(prev => !prev)
        // utils.course.isCompleted.setData({ courseId: course.id}, prevToggle)
    },
  onSettled: () => {
        router.refresh()
       // utils.user.getCourses.refetch()
      //  utils.course.isCompleted.invalidate()
      // utils.course.create.isMutating()
      //  const prevQuestions = utils.chapters.getQuestions.getData({ chapterId: chapter.id})
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

  return <>
    <Dialog open={open} onOpenChange={setOpen}>
         <DialogContent className="font-semibold dark:bg-[#1f1e20]">
            <DialogHeader>Are you sure you want to delete this course?</DialogHeader>
             <div className="flex items-center gap-3 justify-end">
                 <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg bg-blue-600">Cancel</button>
                 <button onClick={() => {
                    setOpen(false)
                    deleteCourse.mutate({ courseId: course.id})
                 }} className="px-4 py-2 rounded-lg bg-red-600">Delete</button>
             </div>
         </DialogContent>
    </Dialog>
   <div className="relative group flex flex-col gap-2 border rounded-lg dark:border-secondary">
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

        {isPro && (
               <button onClick={() => setOpen(true)} disabled={deleteCourse.isPending} className="absolute top-2 right-2 p-1.5 rounded-lg lg:opacity-0 lg:group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-500 duration-200 disabled:cursor-not-allowed disabled:opacity-100 disabled:hover:bg-transparent">
               {deleteCourse.isPending ? (
                      <div className="size-5 border-[3px] border-red-500/30 rounded-full animate-spin border-t-red-500"/>
                  ) : (
                      <Trash2 className="size-5"/>
                  )}
               </button>
        )}
     
    </div>
  </>
}
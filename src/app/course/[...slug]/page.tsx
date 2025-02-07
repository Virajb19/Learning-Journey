import { notFound, redirect } from "next/navigation"
import CourseSidebar from "~/components/CourseSidebar"
import QuizCards from "~/components/QuizCards"
import VideoSummary from "~/components/VideoSummary"
import { auth } from "~/server/auth"
import { db } from "~/server/db"
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link"
import { twMerge } from "tailwind-merge"

export default async function page({ params } : { params: Promise<{ slug: string[]}>}) {
  
  const session = await auth()
  if(!session || !session.user) return redirect('/signin')

  const { slug } = await params

  const [courseId, unitIdxParam, chapterIdxParam] = slug

  const course = await db.course.findUnique({ where: { id: courseId}, include: { units: { include: { chapters: { include: { questions: true}}}}}})
  if(!course) return notFound()

  const unitIdx = parseInt(unitIdxParam ?? '0')
  const chapterIdx = parseInt(chapterIdxParam ?? '0')

  const unit = course.units[unitIdx]
  if(!unit) return redirect('/courses')
  
  const chapter = unit.chapters[chapterIdx]
  if(!chapter) return redirect('/courses')

  const prevChapter = unit.chapters[chapterIdx - 1]
  const nextChapter = unit.chapters[chapterIdx + 1]

  return <div className="w-full min-h-screen pt-24 pb-10 flex gap-3">
            <CourseSidebar course={course} currentChapterId={chapter.id}/>
            <div className="flex flex-col w-4/5 gap-4">
              <div className="flex items-center gap-3">
                <VideoSummary chapter={chapter} unitIdx={unitIdx} chapterIdx={chapterIdx}/>
                <QuizCards chapter={chapter}/>
              </div>
               <div className={twMerge("flex items-center justify-between border-t border-secondary-foreground p-2", !prevChapter && 'justify-end')}>
                   {prevChapter && (
                   <Link href={`/course/${course.id}/${unitIdx}/${chapterIdx - 1}`}>
                     <div className="flex items-center gap-2">
                        <ChevronLeft className="size-7" strokeWidth={3}/>
                        <div className="flex flex-col items-start">
                            <span className="text-secondary-foreground/60 uppercase font-semibold">Previous</span>
                            <h3 className="text-4xl font-bold">{prevChapter.name}</h3>
                        </div>
                     </div>
                     </Link>
                   )}
                   {nextChapter && (
                     <Link href={`/course/${courseId}/${unitIdx}/${chapterIdx + 1}`}>
                         <div className="flex items-center gap-2">
                             <div className="flex flex-col items-end">
                                <span className="text-secondary-foreground/60 uppercase font-semibold">Next</span>
                                <h3 className="text-4xl font-bold">{nextChapter.name}</h3>
                             </div>
                             <ChevronRight className="size-7" strokeWidth={3}/>
                         </div>
                     </Link>
                   )}
               </div>
            </div>
  </div>
}
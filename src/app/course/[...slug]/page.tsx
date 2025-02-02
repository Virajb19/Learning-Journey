import { notFound, redirect } from "next/navigation"
import CourseSidebar from "~/components/CourseSidebar"
import { auth } from "~/server/auth"
import { db } from "~/server/db"

export default async function page({ params } : { params: { slug: string[]}}) {
  
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

  return <div className="w-full min-h-screen pt-24">
         <div className="flex">
            <CourseSidebar course={course} currentChapterId={chapter.id}/>
         </div>
  </div>
}
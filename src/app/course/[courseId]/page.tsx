import { notFound, redirect } from "next/navigation"
import { auth } from "~/server/auth"
import { db } from "~/server/db"

export default async function page({ params: { courseId } } : { params: { courseId: string}}) {
    const session = await auth()
    if(!session || !session.user) return redirect('/signin')
    
    const course = await db.course.findUnique({ where: { id: courseId}, include: { units: { include: { chapters: true}}}})
    if(!course) return notFound()

  return <div className="w-full min-h-screen pt-20">
      {courseId}
  </div>
}
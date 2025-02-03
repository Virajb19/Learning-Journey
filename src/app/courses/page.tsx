import { redirect } from "next/navigation"
import CourseCard from "~/components/CourseCard"
import { auth } from "~/server/auth"
import { db } from "~/server/db"

export default async function page() {

  const session = await auth()
  if(!session || !session.user) return redirect('/')
  const userId = parseInt(session.user.id)

  const courses = await db.course.findMany({ where: { userId }, orderBy: { createdAt: 'desc'}, include: { units: { include: { chapters: { select: { id: true}}}}}})

  return <div className="w-full min-h-screen pt-24">
             <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 place-items-center">
                {courses.map(course => {
                  return <CourseCard key={course.id} course={course}/>
                })}
        </div>
  </div>
}
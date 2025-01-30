import { notFound, redirect } from "next/navigation"
import { auth } from "~/server/auth"
import { db } from "~/server/db"
import { InfoIcon } from 'lucide-react'
import ConfirmChapters from "~/components/ConfirmChapters"

export default async function page({ params } : { params: { courseId: string}}) {
    const session = await auth()
    if(!session || !session.user) return redirect('/signin')

    const { courseId } = await params
    const course = await db.course.findUnique({ where: { id: courseId}, include: { units: { include: { chapters: { select: { id: true, name: true, unitId: true} }}}}})
    if(!course) return notFound()

  return <div className="w-full min-h-screen">
       <div className="w-1/2 mb:w-full mx-auto max-w-5xl flex flex-col p-1 gap-3 my-24">
            <div className="flex flex-col gap-2">
                 <h5 className="text-lg uppercase font-semibold text-secondary-foreground/60">Course name</h5>
                 <h2 className="font-semibold">{course.name}</h2>
                 <div className="flex items-center gap-2 bg-secondary p-2 rounded-md">
                    <InfoIcon className="size-5 text-blue-500"/>
                    <p>We generated chapters for each of your units. Look over them and then
                    click the Button to confirm and continue</p>
                 </div>
            </div>
            <ConfirmChapters course={course}/>
       </div>
  </div>
}
import { notFound, redirect } from "next/navigation"
import { auth } from "~/server/auth"
import { db } from "~/server/db"
import { InfoIcon } from 'lucide-react'
import ConfirmUnits from "~/components/ConfirmUnits"

export default async function page({ params } : { params: Promise<{ courseId: string}>}) {
    const session = await auth()
    if(!session || !session.user) return redirect('/signin')
    const userId = parseInt(session.user.id)

    const { courseId } = await params
    const course = await db.course.findUnique({ where: { id: courseId, userId}, include: { units: { include: { chapters: { select: { id: true, name: true, unitId: true, videoId: true}}}}}})

    if(!course) return notFound()

    const hasGeneratedContent = course.units.some(unit => unit.chapters.some(c => c.videoId))
    if(hasGeneratedContent) return redirect(`/course/${course.id}/0/0`)

  return <div className="w-full min-h-screen">
       <div className="w-1/2 mb:w-full mb:p-4 mx-auto max-w-5xl flex flex-col p-1 gap-3 my-24">
            <div className="flex flex-col gap-2">
                 <h5 className="text-lg uppercase font-semibold text-secondary-foreground/60">Course name</h5>
                 <h2 className="font-semibold">{course.name}</h2>
                 <div className="flex items-center gap-2 bg-secondary p-2 rounded-md">
                    <InfoIcon className="size-5 text-blue-500"/>
                    <p>We generated chapters for each of your units. Look over them and then
                    click the Button to confirm and continue</p>
                 </div>
            </div>
            <ConfirmUnits course={course}/>
       </div>
  </div>
}
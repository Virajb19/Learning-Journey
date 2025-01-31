import { redirect } from "next/navigation";
import CreateCourseForm from "~/components/CreateCourseForm";
import { auth } from "~/server/auth";
import { InfoIcon } from 'lucide-react'

import { db } from "~/server/db";
import ProgressSection from "~/components/ProgressSection";

export default async function CreatePage() {

  const session = await auth()
  if(!session || !session.user) return redirect('/')
  const userId = parseInt(session.user.id)

  const courseCount = await db.course.count({ where: { userId}})

  return <div className="w-full min-h-screen pt-20 pb-10">
  <div className="w-1/2 mb:w-full mx-auto flex flex-col items-center p-1">
      <h1 className="text-6xl mb:text-4xl font-bold">Learning Journey</h1>
       <div className="flex items-center mb:items-start gap-3 bg-secondary rounded-sm w-full text-base font-semibold my-4 p-2">
          <InfoIcon className="text-blue-600 size-12"/>
           <p>
            Enter in a course title, or what you want to learn about. Then enter a
            list of units, which are the specifics you want to learn. And our AI
            will generate a course for you!
           </p>
       </div>
        <CreateCourseForm />
        <ProgressSection courseCount={courseCount}/>
     </div>
  </div>
}
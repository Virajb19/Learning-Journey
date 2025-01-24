import { redirect } from "next/navigation";
import CreateCourseForm from "~/components/CreateCourseForm";
import { auth } from "~/server/auth";

export default async function CreatePage() {

  // const session = await auth()
  // if(!session || !session.user) return redirect('/')

  return <div className="w-full border flex flex-col items-center p-1">
        <CreateCourseForm />
  </div>
}
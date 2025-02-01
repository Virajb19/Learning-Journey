import { redirect } from "next/navigation"
import { auth } from "~/server/auth"

export default async function page() {
  
  const session = await auth()
  if(!session || !session.user) return redirect('/signin')

  return <div className="w-full min-h-screen py-24">
        course
  </div>
}
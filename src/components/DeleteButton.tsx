import { toast } from "sonner"
import { api } from "~/trpc/react"
import { useRouter } from 'nextjs-toploader/app'
import { Trash2 } from 'lucide-react'

export default function DeleteButton({ courseId }: { courseId: string}) {

  const router = useRouter()

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

  return <button onClick={() => deleteCourse.mutate({ courseId })} disabled={deleteCourse.isPending} className="absolute top-2 right-2 p-1.5 rounded-lg lg:opacity-0 lg:group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-500 duration-200 disabled:cursor-not-allowed disabled:opacity-100 disabled:hover:bg-transparent">
              {deleteCourse.isPending ? (
                   <div className="size-5 border-[3px] border-red-500/30 rounded-full animate-spin border-t-red-500"/>
              ) : (
               <Trash2 className="size-5"/>
          )}
  </button>
}
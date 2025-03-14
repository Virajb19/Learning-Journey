'use client'

import { Progress } from "~/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger} from '~/components/ui/tooltip'
import { Zap } from 'lucide-react'
import { api } from "~/trpc/react";
import { toast } from "sonner";

export default function ProgressSection({ courseCount } : { courseCount: number}) {

    const subscribe = api.user.subscribe.useMutation({
        onSuccess: ({url}) => {
           window.location.href = url!
        },
        onError: (err) => console.error(err)
    })

  return <div className="flex flex-col items-center gap-3 bg-secondary dark:bg-white/5 p-3 w-1/2 mb:w-4/5 mt-5 rounded-md">
           <p className="text-2xl font-semibold"> {courseCount} / 10 Free generations!</p>
           <Progress value={courseCount * 10} className="bg-white/10"/>
        <Tooltip>
            <TooltipTrigger>
                <button disabled={subscribe.isPending} onClick={() => {
                     toast.promise(subscribe.mutateAsync(), { loading: 'Directing to Stripe page...', success: 'Directed', error: 'Something went wrong!'})
                }} className="flex-center gap-2 px-4 py-2 font-bold text-xl text-white rounded-lg bg-gradient-to-tr from-green-600 to-blue-500 hover:from-green-500 hover:to-blue-600 duration-300 disabled:cursor-not-allowed disabled:opacity-70">
                    <Zap strokeWidth={3} className="fill-white"/> Upgrade
                </button>
            </TooltipTrigger>
            <TooltipContent sideOffset={10} side="top" className="border-[3px] rounded-sm text-lg font-semibold border-white">
                    Upgrade to get more generations!
            </TooltipContent>
        </Tooltip>
</div>
}
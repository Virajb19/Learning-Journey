'use client'

import { useSession } from "next-auth/react"
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import Link from "next/link"
import { Skeleton } from "~/components/ui/skeleton"

export default function HomePage() {

  const { data: session, status} = useSession()
  const isAuth = !!session?.user

  return <div className="w-full min-h-screen border flex-center">
         <motion.div initial={{opacity: 0, scale: 0.7}} animate={{opacity: 1, scale: 1}} transition={{duration: 0.4, type: 'spring', bounce: 0.6}}
            className="flex flex-col gap-2 w-1/4 mb:w-[90%] bg-white/10 rounded-lg p-5 border-[2.5px] dark:border-transparent">
             <h1 className="text-4xl font-bold truncate">Welcome! {session?.user.name?.toUpperCase()}</h1>
              <p className="font-semibold flex items-center gap-2">
                 <Sparkles className="text-amber-600 fill-amber-600"/>
                 Start your learning Journey
              </p>
               {status === 'loading' ? (
                 <Skeleton className="h-10"/>
               ) : (
                 <>
                       <Link href={isAuth ? '/create' : '/signup'} className="flex-center gap-1 group rounded-lg p-2 bg-secondary">
                          {isAuth ? 'Create a course' : 'Signup to get started'}
                          <ArrowRight className="group-hover:translate-x-2 duration-300"/>
                    </Link>
                 </>
               )} 
         </motion.div>
  </div>
}
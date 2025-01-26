'use client'

import { BookOpenText, Loader2, LogIn } from 'lucide-react';
import { motion } from 'framer-motion'
import { ThemeToggle } from './ThemeToggle';
import UserAccountNav from './UserAccountNav';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  
  const { data: session, status } = useSession()
  const isAuth = !!session 

  return <motion.nav initial={{ opacity: 0, y: -17 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: 'spring', damping: 7, stiffness: 100 }}
  className="fixed inset-x-0 top-0 z-[999] p-3 flex items-center justify-between bg-white dark:bg-gray-950 border-b border-zinc-300">
        <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} whileHover={{y: -4, transition: { duration: 0.2, ease: 'easeInOut'}}} transition={{duration: 0.4, delay: 0.5, type: 'spring', damping: 10, stiffness: 200}} 
         className='flex items-center gap-2 border-2 border-b-4 border-r-4 p-2 rounded-md border-gray-300'>
            <BookOpenText className='size-7 mb:size-5' strokeWidth={3}/>
            <h1 className='text-3xl mb:text-lg font-extrabold'>Learning Journey</h1>
        </motion.div>
        <div className='flex items-center gap-1'>
              <ThemeToggle />
              {status === 'loading' ? <Loader2 className='animate-spin size-10'/> : isAuth ? <UserAccountNav /> : <Link className='flex items-center font-medium mb:hidden gap-2 p-2 rounded-lg bg-secondary dark:bg-white/10 text-xl dark:text-white group' href={'/signin'}>Sign in<LogIn className='group-hover:translate-x-0.5 duration-200'/></Link>}
        </div>
  </motion.nav>
}
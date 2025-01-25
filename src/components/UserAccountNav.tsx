'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "~/components/ui/dropdown-menu"
import { LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import UserAvatar from './UserAvatar';

export default function UserAccountNav() {

    const {data: session} = useSession()
    const user = session?.user

    return <main className="mb:text-xs">
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger>
                        <UserAvatar />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='m-2 min-w-44 z-[99999] rounded-md bg-neutral-100 dark:bg-neutral-900 border-[3px] border-white font-semibold' align='center'> 
                     <DropdownMenuItem>
                        <div className='flex flex-col'>
                            {user?.name && <p className='text-lg'>{user.name}</p>}
                            {user?.email && <p className='text-sm text-zinc-500 truncate'>{user.email}</p>}
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem className='outline-none cursor-pointer' onClick={() => signOut({callbackUrl: '/'})}>
                       <span className='flex items-center gap-2 text-base transition-all duration-300 hover:text-red-500'><LogOut className='size-4'strokeWidth={3}/>Log out </span>
                       </DropdownMenuItem>

                    </DropdownMenuContent>
                </DropdownMenu>
        </main>
}
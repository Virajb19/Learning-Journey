'use client'

import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from 'zod' 
import { createCourseSchema } from "~/lib/zod";
import { motion, AnimatePresence} from 'framer-motion'
import { Plus, Trash, Loader2, ChevronDown, Check } from 'lucide-react'
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useRouter } from 'nextjs-toploader/app'
import { useEffect, useState } from "react";

type Input = z.infer<typeof createCourseSchema>

export default function CreateCourseForm() {

  const createCourse = api.course.create.useMutation()

  const router = useRouter()

  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<Input>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: { title: '', units: ['','',''], level: 'intermediate'}
  })

  async function onSubmit(data: Input) {
     if(data.units.some(unit => unit === '')) { 
         toast.error('Please fill all the units', { position: 'bottom-right'})
         return
     }

     await createCourse.mutateAsync(data, {
       onSuccess: ({courseId}) => {
          toast.success('Course created')
          form.reset()
          router.push(`/create/${courseId}`)
       },
       onError: (err) => {
          console.error(err)
          toast.error(err.message)
       }
     })
  }

  useEffect(() => {
     const handleKeyDowm = (e: KeyboardEvent) => {
         if(e.key === 'Enter') {
             const button = document.getElementById('submit') as HTMLButtonElement
             if(button) button.click()
         }
     }

     const handleClickOutside = (e: MouseEvent) => {
        const dropdown = document.getElementById("dropdown") as HTMLDivElement
        if (dropdown && !dropdown.contains(e.target as Node)) {
          setIsOpen(false)
        }
    }

     document.addEventListener('keydown', handleKeyDowm)
     document.addEventListener("mousedown", handleClickOutside)

      return () =>{
        document.removeEventListener('keydown', handleKeyDowm)
        document.removeEventListener("mousedown", handleClickOutside)
      }

  }, [])

  form.watch()

  return <div className="w-full">
          <Form {...form}>
               <form className="flex flex-col px-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                          control={form.control}
                          name="title"
                          render={({ field, fieldState }) => (
                            <FormItem className="flex mb:flex-col mb:items-start items-center p-1">
                              <FormLabel className="flex-[1] text-2xl font-semibold">Title</FormLabel>
                              <FormControl className="flex-[6] mb:w-full">
                                <input className={twMerge("input-style", fieldState.error && 'focus:border-red-700')} placeholder="Enter the main topic of the course(e.g. 'Calculus')" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                      <AnimatePresence>
                          {form.watch('units').map((_,i) => {
                            return <motion.div key={i} initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}} transition={{duration: 0.2, ease: 'easeInOut'}}>
                                     <FormField
                                        control={form.control}
                                        name={`units.${i}`}
                                        render={({ field }) => (
                                          <FormItem className="flex mb:flex-col mb:items-start items-center p-1">
                                            <FormLabel className="flex-[1] text-2xl font-semibold">Unit {i + 1}</FormLabel>
                                            <FormControl className="flex-[6] mb:w-full">
                                              <input className="input-style" placeholder="Enter subtopic of the course(e.g. 'What is differentiation?')" {...field} />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                    />
                            </motion.div>
                          })}
                      </AnimatePresence>

                       <div className="flex mb:flex-col mb:items-start items-center my-4 uppercase">
                           <h3 className="flex-[1] text-2xl font-semibold">Level</h3>
                           <div id="dropdown" onClick={() => setIsOpen(!isOpen)} className="flex-[6] relative mb:w-full text-gray-400 dark:text-white flex items-center justify-between bg-[#474549] cursor-pointer dark:bg-black p-4 mb:p-2 font-semibold rounded-sm text-xl mb:text-lg">
                              {form.watch('level')} <ChevronDown className={twMerge('duration-300 transition-all', isOpen && 'rotate-180')}/>
                           <AnimatePresence>
                               {isOpen && (
                                  <motion.div initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.9}} transition={{duration: 0.2, ease: 'easeInOut'}}
                                      className="absolute z-50 mt-2 inset-x-0 top-full space-y-3 border-[3px] border-white rounded-md p-2 bg-neutral-100 dark:bg-neutral-900">
                                         {['beginner', 'intermediate', 'advanced'].map(level => {
                                            const isSelected = level === form.watch('level')
                                            return <button onClick={(e) => {
                                              form.setValue('level', level)
                                            }} key={level} className={twMerge("flex items-center justify-between gap-3 p-2 w-full text-lg uppercase hover:bg-white/10 rounded-sm font-semibold text-gray-400 duration-200", 
                                               level === 'beginner' && 'hover:text-green-600',
                                               level === 'intermediate' && 'hover:text-yellow-400',
                                               level === 'advanced' && 'hover:text-red-600'
                                            )}>
                                                 {level}
                                                 {isSelected && <Check strokeWidth={3}/>}
                                            </button>
                                         })}
                                  </motion.div>
                               )}
                                 </AnimatePresence>
                           </div>
                       </div>

                       <div className="flex-center gap-2 text-lg font-semibold my-4">
                            <button onClick={() => form.setValue('units', [...form.watch('units'), ""])} type="button" disabled={form.watch('units').length >= 5} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 dark:bg-white/10">
                                <Plus className="text-green-500" strokeWidth={3}/> Add unit 
                            </button>

                            <button onClick={() => form.setValue('units', form.watch('units').slice(0,-1))} type="button" disabled={form.watch('units').length === 1} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 dark:bg-white/10">
                                 <Trash className="text-red-500" strokeWidth={3}/>  Remove unit
                            </button>
                       </div>


                       <button id="submit" disabled={form.formState.isSubmitting} type="submit" className="font-bold w-3/4 mb:w-full mx-auto py-2 flex-center gap-2 bg-[#bab4be] dark:bg-white text-black rounded-sm disabled:cursor-not-allowed disabled:opacity-70">
                            {form.formState.isSubmitting ? (
                              <>
                                 <Loader2 className="animate-spin" strokeWidth={2}/> 
                                 <span className="animate-pulse">creating...</span>
                              </>
                            ): "Let's Go!"}
                       </button>
                    
               </form>
          </Form>
  </div>
}
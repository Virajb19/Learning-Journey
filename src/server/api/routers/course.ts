import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from '@trpc/server';
import { createCourseSchema } from "~/lib/zod";
import { getImageSearchTerm, generateChapters, getChapterContents } from "~/lib/gemini";
import axios from 'axios'
import { Level } from '@prisma/client'
import { z } from 'zod'
import { getTranscript, searchYoutube } from "~/lib/youtube";

type outputUnit = {
    title: string,
    chapters: {
       youtube_search_query: string; 
       name: string;
    } []
}

export const courseRouter = createTRPCRouter({ 
    create: protectedProcedure.input(createCourseSchema).mutation(async ({ ctx, input}) => {
         const { id, credits, isPro } = ctx.session.user
         const userId = parseInt(id)

         if(!isPro && credits <= 0) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'No credits. Buy subscription'})
         }

         const { title, units, level } = input

         const imageSearchTerm = await getImageSearchTerm(`you are an AI capable of finding the most relevant image for a course. Please provide a good image search term for the title of a course about ${title}. This search term will be fed into the unsplash API, so make sure it is a good search term that will return good results. Just provide the term. Dont write anything else.`)
         const { data } = await axios.get(`https://api.unsplash.com/search/photos?per_page=1&query=${imageSearchTerm}&client_id=${process.env.UNSPLASH_API_KEY}`)
         const image = data.results[0].urls.small_s3 as string

         const outputUnits = await generateChapters(title, units)
         if(units.length !== outputUnits.length) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong'})

         const course = await ctx.db.$transaction(async tx => {
            const course = await tx.course.create({ data: { name: title, image, level: level.toUpperCase() as Level, userId}, select: { id: true}})
            const units = await tx.unit.createManyAndReturn({ data: outputUnits.map(outputUnit => ({name: outputUnit.title, courseId: course.id})), select: { id: true}})

            await Promise.all(units.map(async (unit, i) => {
                 if(!outputUnits[i]) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR'})
                 await tx.chapter.createMany({ data: outputUnits[i].chapters.map(chapter => ({name: chapter.name, youtubeSearchQuery: chapter.youtube_search_query, unitId: unit.id}))})
            }))
            
            if(!isPro) {
               await tx.user.update({where: { id: userId }, data: { credits: { decrement: 1}}})
            }
            return course
         })

         return { courseId: course.id }
    }),
    toggleCompletion: protectedProcedure.input(z.object({courseId: z.string().cuid()})).mutation(async ({ ctx, input}) => {
       const { courseId } = input
       const course = await ctx.db.course.findUnique({ where: { id: courseId}, select: { isCompleted: true}})
       if(!course) throw new TRPCError({ code: 'NOT_FOUND', message: 'course not found'})
      
       await ctx.db.course.update({ where: { id: courseId}, data: { isCompleted: !course.isCompleted}})
       return { isCompleted: course.isCompleted}
    }),
    isCompleted: protectedProcedure.input(z.object({ courseId: z.string().cuid()})).query(async ({ ctx, input}) => {
         const { courseId } = input
         const course = await ctx.db.course.findUnique({ where: { id: courseId}, select: { isCompleted: true}})
         if(!course) throw new TRPCError({ code: 'NOT_FOUND', message: 'course not found'})
      
         return { isCompleted: course.isCompleted}
     }),
    delete: protectedProcedure.input(z.object({ courseId: z.string().cuid()})).mutation(async ({ ctx, input}) => {
          const { courseId } = input
          const user = ctx.session.user

          if(!user.isPro) throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized'})

          const course = await ctx.db.course.findUnique({ where: { id: courseId}, select: { id: true}})
          if(!course) throw new TRPCError({ code: 'NOT_FOUND', message: 'course not found'})

            await ctx.db.course.update({ where: { id: course.id}, data: { deletedAt: new Date()}})
         //  await ctx.db.course.delete({ where: { id: course.id}})

          return { success: true}
    }),
    createQuestions: protectedProcedure.input(z.object({courseId: z.string().cuid()})).mutation(async ({ctx,input}) => {
      const course = await ctx.db.course.findUnique({ where: { id: input.courseId}, include: { units: { include: { chapters: { select: { id: true, name: true, unitId: true, videoId: true, youtubeSearchQuery: true}}}}}})
      if(!course) throw new TRPCError({code: 'NOT_FOUND', message: 'course not found'})

      const chapters = course.units.flatMap(unit => unit.chapters)
      const responses = await Promise.allSettled(chapters.map(async chapter => {
           const videoId = await searchYoutube(chapter.youtubeSearchQuery)
           let transcript = await getTranscript(videoId)
           const maxLength = 500
           transcript = transcript.split(' ').slice(0, maxLength).join(" ")
           return { videoId, transcript }
      }))

      const processedResponses = responses.map(response => response.status === 'fulfilled' ? response.value :  { videoId: '', transcript: '' })
      
      const formattedChapters = chapters.map((chapter,i) => {
           return {
                name: chapter.name,
                transcript: processedResponses[i]?.transcript ?? ''
           }
      })
      const chaptersContent = await getChapterContents(formattedChapters, course.level)

      await Promise.all(chapters.map(async (chapter,i) => {
           const content = chaptersContent[chapter.name]
           if(!content) return
           await ctx.db.chapter.update({where: {id: chapter.id}, data: { summary: content.summary, videoId: processedResponses[i]?.videoId}})
           await ctx.db.question.createMany({data: content.questions.map(q => {
                const options = q.options.sort(() => Math.random() - 0.5)
                return {
                     question: q.question,
                     answer: q.answer,
                     options,
                     chapterId: chapter.id
                }
           })})
      }))     
      return { success: true}      
})
 
})
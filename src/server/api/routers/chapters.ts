import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from '@trpc/server';
import { z } from 'zod'
import { getTranscript, searchYoutube } from "~/lib/youtube";
import { getChapterContents, getQuestions, getVideoSummary } from "~/lib/gemini";

export const chapterRouter = createTRPCRouter({
    create: protectedProcedure.input(z.object({ chapterId: z.string().cuid()})).mutation(async ({ ctx, input}) => {

         const { chapterId } = input

         const chapter = await ctx.db.chapter.findUnique({ where: { id: chapterId}, select: { id: true, name: true, youtubeSearchQuery: true, unit: { select: { course: { select: { level: true}}}}}})
         if(!chapter) throw new TRPCError({ code: 'NOT_FOUND', message: 'chapter not found'})

        //  await new Promise(res => setTimeout(res, 10 * 1000 * Math.random()))

         const videoId = await searchYoutube(chapter.youtubeSearchQuery)
         let transcript = await getTranscript(videoId)
         const maxLength = 500
         transcript = transcript.split(' ').slice(0, maxLength).join(" ")

         const summary = await getVideoSummary(transcript)

         const level = chapter.unit.course.level
         const questions = await getQuestions(chapter.name, transcript, level)

         await ctx.db.$transaction(async tx => {
            await tx.question.createMany({ data: questions.map(q => {
                 const options = q.options.sort(() => Math.random() - 0.5)
                 return {
                    question: q.question,
                    answer: q.answer,
                    options,
                    chapterId
                 }
            })})
            await tx.chapter.update({ where: { id: chapterId}, data: { summary, videoId }})
         })

        return { success: true }
    }),
    
    getQuestions: protectedProcedure.input(z.object({ chapterId: z.string().cuid()})).query(async ({ ctx, input}) => {
         const { chapterId } = input
         const chapter = await ctx.db.chapter.findUnique({ where: { id: chapterId}, select: { id: true}})
         if(!chapter) throw new TRPCError({ code: 'NOT_FOUND', message: 'chapter not found'})

         const questions = await ctx.db.question.findMany({ where: { chapterId }})
         return questions
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
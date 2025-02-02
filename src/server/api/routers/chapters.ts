import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from '@trpc/server';
import { z } from 'zod'
import { getTranscript, searchYoutube } from "~/lib/youtube";
import { getQuestions, getVideoSummary } from "~/lib/gemini";

export const chapterRouter = createTRPCRouter({
    create: protectedProcedure.input(z.object({ chapterId: z.string()})).mutation(async ({ ctx, input}) => {

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
    
    getQuestions: protectedProcedure.input(z.object({ chapterId: z.string()})).query(async ({ ctx, input}) => {
         const { chapterId } = input
         const chapter = await ctx.db.chapter.findUnique({ where: { id: chapterId}, select: { id: true}})
         if(!chapter) throw new TRPCError({ code: 'NOT_FOUND', message: 'chapter not found'})

         const questions = await ctx.db.question.findMany({ where: { chapterId }})
         return questions
    })
})
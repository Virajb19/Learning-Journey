import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from '@trpc/server';
import { z } from 'zod'
import { getTranscript, searchYoutube } from "~/lib/youtube";
import { getQuestions, getVideoSummary } from "~/lib/gemini";

export const chapterRouter = createTRPCRouter({
    create: protectedProcedure.input(z.object({ chapterId: z.string()})).mutation(async ({ ctx, input}) => {

         const { chapterId } = input

         const chapter = await ctx.db.chapter.findUnique({ where: { id: chapterId}, select: { id: true, name: true, youtubeSearchQuery: true}})
         if(!chapter) throw new TRPCError({ code: 'NOT_FOUND', message: 'chapter not found'})

         const videoId = await searchYoutube(chapter.youtubeSearchQuery)
         let transcript = await getTranscript(videoId)
         const maxLength = 500
         transcript = transcript.split(' ').slice(0, maxLength).join(" ")

         const summary = await getVideoSummary(transcript)

         const questions = await getQuestions(chapter.name, transcript)

         await ctx.db.$transaction(async tx => {
            await tx.question.createMany({ data: questions.map(q => ({ question: q.question, answer: q.answer, options: q.options, chapterId}))})
            await tx.chapter.update({ where: { id: chapterId}, data: { summary, videoId }})
         })

        return { success: true }
    })
})
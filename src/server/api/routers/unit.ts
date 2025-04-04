import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from '@trpc/server';
import { z } from "zod";
import { getTranscript, searchYoutube } from "~/lib/youtube";
import { getChapterContents } from "~/lib/gemini";

export const unitRouter = createTRPCRouter({
    createQuestions: protectedProcedure.input (z.object({unitId: z.string().cuid()})).mutation(async ({ctx,input}) => {
         const unit = await ctx.db.unit.findUnique({where: {id: input.unitId}, include: {chapters: true, course: { select: { level: true}}}})
         if(!unit) throw new TRPCError({code: 'NOT_FOUND', message: 'unit not found'})

         const chapters = unit.chapters

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

       console.log(`Generating chapters content for: ${unit.name}`)
       const chaptersContent = await getChapterContents(formattedChapters, unit.course.level)
 
       // Transaction
       await Promise.allSettled(chapters.map(async (chapter,i) => {
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
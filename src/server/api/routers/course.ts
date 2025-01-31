import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from '@trpc/server';
import { createCourseSchema } from "~/lib/zod";
import { getImageSearchTerm, generateChapters } from "~/lib/gemini";
import axios from 'axios'

type outputUnit = {
    title: string,
    chapters: {
       youtube_search_query: string; 
       name: string;
    } []
}

export const courseRouter = createTRPCRouter({ 
    create: protectedProcedure.input(createCourseSchema).mutation(async ({ ctx, input}) => {
         const { id, credits } = ctx.session.user
         const userId = parseInt(id)

         if(credits <= 0) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'No credits'})
         }

         const { title, units } = input

         const imageSearchTerm = await getImageSearchTerm(`you are an AI capable of finding the most relevant image for a course. Please provide a good image search term for the title of a course about ${title}. This search term will be fed into the unsplash API, so make sure it is a good search term that will return good results. Just provide the term. Dont write anything else.`)
         const { data } = await axios.get(`https://api.unsplash.com/search/photos?per_page=1&query=${imageSearchTerm}&client_id=${process.env.UNSPLASH_API_KEY}`)
         const image = data.results[0].urls.small_s3 as string

         const outputUnits = await generateChapters(title, units)
         if(units.length !== outputUnits.length) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong'})

         const course = await ctx.db.$transaction(async tx => {
            const course = await tx.course.create({ data: { name: title, image, userId}, select: { id: true}})
            const units = await tx.unit.createManyAndReturn({ data: outputUnits.map(outputUnit => ({name: outputUnit.title, courseId: course.id})), select: { id: true}})

            await Promise.all(units.map(async (unit, i) => {
                 if(!outputUnits[i]) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR'})
                 await tx.chapter.createMany({ data: outputUnits[i].chapters.map(chapter => ({name: chapter.name, youtubeSearchQuery: chapter.youtube_search_query, unitId: unit.id}))})
            }))
            
            await tx.user.update({where: { id: userId }, data: { credits: { decrement: 1}}})
            return course
         })

         return { courseId: course.id }

    })
})
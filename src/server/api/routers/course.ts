import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from '@trpc/server';
import { createCourseSchema } from "~/lib/zod";

export const courseRouter = createTRPCRouter({
    create: protectedProcedure.input(createCourseSchema).mutation(async ({ ctx, input}) => {
         const credits = ctx.session.user.credits

         if(credits === 0) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'No credits'})
         }
    })
})
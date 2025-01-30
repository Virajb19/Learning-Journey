import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from '@trpc/server';
import { z } from 'zod'

export const chapterRouter = createTRPCRouter({
    create: protectedProcedure.input(z.object({ chapterId: z.string()})).mutation(({ ctx, input}) => {

    })
})
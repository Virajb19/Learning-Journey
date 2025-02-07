import { SignUpSchema } from '~/lib/zod';
import bcrypt from 'bcrypt'
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from '@trpc/server';

export const userRouter = createTRPCRouter({
     signup: publicProcedure.input(SignUpSchema).mutation(async ({ ctx, input}) => {

           const { username, email, password} = input

           const userExists = await ctx.db.user.findUnique({ where: { email }, select: { id: true}})
           if(userExists) throw new TRPCError({ code: 'FORBIDDEN', message: 'user already exists'})

           const hashedPassword = await bcrypt.hash(password,10)
           await ctx.db.user.create({data: {username,email,password: hashedPassword}})

           return { message: 'signed up successfully'}
     }),
     getCourses: protectedProcedure.query(async ({ ctx }) => {
          const userId = parseInt(ctx.session.user.id)
          const courses = await ctx.db.course.findMany({ where: { userId }, orderBy: { createdAt: 'desc'}, include: { units: { include: { chapters: { select: { id: true}}}}}})
          return courses
     }),
     subscribe: protectedProcedure.mutation(async ({ ctx, input}) => {
         
     })
})
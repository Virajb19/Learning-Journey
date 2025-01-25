import { z } from 'zod'
import { SignUpSchema } from '~/lib/zod';
import bcrypt from 'bcrypt'
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from '@trpc/server';

export const userRouter = createTRPCRouter({
     signup: publicProcedure.input(SignUpSchema).mutation(async ({ ctx, input}) => {

           const { username, email, password} = input

           const userExists = await ctx.db.user.findUnique({ where: { email }, select: { id: true}})
           if(userExists) throw new TRPCError({ code: 'FORBIDDEN', message: 'user already exists'})

           const hashedPassword = await bcrypt.hash(password,10)
           await ctx.db.user.create({data: {username,email,password: hashedPassword}})

           return { message: 'signed up successfully'}
     })
})
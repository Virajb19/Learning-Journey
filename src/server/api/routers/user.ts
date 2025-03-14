import { SignUpSchema } from '~/lib/zod';
import bcrypt from 'bcrypt'
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from '@trpc/server';
import { stripe } from '~/lib/stripe'

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

         const userId = parseInt(ctx.session.user.id)
         const userSubscription = await ctx.db.userSubscription.findUnique({ where: { userId}})

         if (userSubscription && userSubscription.stripeCustomerId) {
          const stripeSession = await stripe.billingPortal.sessions.create({
            customer: userSubscription.stripeCustomerId,
            return_url:  `${process.env.NEXT_PUBLIC_APP_URL}/`,
          })
          return { url: stripeSession.url}
        }

        const stripeSession = await stripe.checkout.sessions.create({
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/create`,
          cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/create`,
          payment_method_types: ["card"],
          mode: "subscription",
          billing_address_collection: "auto",
          customer_email: ctx.session.user.email ?? "",
          line_items: [
            {
              price_data: {
                currency: "USD",
                product_data: {
                  name: "Learning Journey Pro",
                  description: "unlimited course generation!",
                },
                unit_amount: 2000,
                recurring: {
                  interval: "month",
                },
              },
              quantity: 1,
            },
          ],
          metadata: {
            userId: ctx.session.user.id,
          },
        })
        return { url: stripeSession.url!}
     })
})
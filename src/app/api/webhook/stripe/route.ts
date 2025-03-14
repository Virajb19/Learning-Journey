import { NextRequest, NextResponse } from "next/server"
import { stripe } from '~/lib/stripe'
import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "~/server/db";

export async function POST(req: NextRequest) {
     try {
        const body = await req.text();
        const headersList = await headers()
        const signature = headersList.get("Stripe-Signature") as string;
        let event: Stripe.Event;

        event = stripe.webhooks.constructEvent(body,signature,process.env.STRIPE_WEBHOOK_SECRET as string)

        const session = event.data.object as Stripe.Checkout.Session;

        if(event.type === 'checkout.session.completed') {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            if(!session?.metadata?.userId) return NextResponse.json({msg: 'No userId found'}, { status: 404})
            const userId = parseInt(session.metadata.userId)

            const priceId = subscription.items.data[0]?.price?.id;
            if (!priceId) return NextResponse.json({ msg: "No price ID found" }, { status: 400 });
                  
            await db.userSubscription.create({
              data: {
                userId,
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                stripePriceId: priceId,
              }
            })

            await db.user.update({where: {id: userId}, data: {isPro: true}})
        }

        if(event.type === 'invoice.payment_succeeded') {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            const priceId = subscription.items.data[0]?.price?.id;
            if (!priceId) return NextResponse.json({ msg: "No price ID found" }, { status: 400 });

            await db.userSubscription.update({
                where: {stripeSubscriptionId: subscription.id}, 
                data: {
                  stripePriceId: priceId,
                  stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
                }
           })
        }

        return NextResponse.json({msg: 'Payment successfull'}, { status: 200})
      
     } catch(err) {
        console.error(err)
        return NextResponse.json({msg: 'Error processing payment. Webhook error'}, { status: 500})
     }
}
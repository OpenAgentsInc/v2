import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/stripe'
import { updateUserCredits } from '@/lib/user'

const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.log(`❌ Error message: ${errorMessage}`)
    return NextResponse.json({ message: `Webhook Error: ${errorMessage}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.mode === 'payment' && session.payment_status === 'paid') {
      const amountTotal = session.amount_total
      const userId = session.client_reference_id

      if (amountTotal && userId) {
        const creditsToAdd = Math.floor(amountTotal / 100) // Convert cents to dollars/credits
        await updateUserCredits(userId, creditsToAdd)
        console.log(`Added ${creditsToAdd} credits to user ${userId}`)
      }
    }
  }

  return NextResponse.json({ message: 'Received' }, { status: 200 })
}
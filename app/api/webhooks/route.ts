import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import type { Stripe } from 'stripe'
import { stripe } from '@/lib/stripe/stripe'
import { updateUserCredits } from '@/db/actions'

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

  // Successfully constructed event.
  console.log("✅ Success:", event.id)

  const permittedEvents: string[] = [
    "checkout.session.completed",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
  ]

  if (permittedEvents.includes(event.type)) {
    try {
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object as Stripe.Checkout.Session
          console.log(`💰 CheckoutSession status: ${session.payment_status}`)
          
          if (session.mode === 'payment' && session.payment_status === 'paid') {
            const amountTotal = session.amount_total
            const userId = session.client_reference_id

            if (amountTotal && userId) {
              const creditsToAdd = Math.floor(amountTotal / 100) // Convert cents to dollars/credits
              const result = await updateUserCredits(userId, creditsToAdd)
              if (result.success) {
                console.log(`Added ${creditsToAdd} credits to user ${userId}. New balance: ${result.newBalance}`)
              } else {
                console.error(`Failed to add credits to user ${userId}: ${result.error}`)
              }
            }
          }
          break
        case "payment_intent.payment_failed":
          const failedPayment = event.data.object as Stripe.PaymentIntent
          console.log(`❌ Payment failed: ${failedPayment.last_payment_error?.message}`)
          break
        case "payment_intent.succeeded":
          const successfulPayment = event.data.object as Stripe.PaymentIntent
          console.log(`💰 PaymentIntent status: ${successfulPayment.status}`)
          break
        default:
          throw new Error(`Unhandled event: ${event.type}`)
      }
    } catch (error) {
      console.log(error)
      return NextResponse.json(
        { message: "Webhook handler failed" },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ message: 'Received' }, { status: 200 })
}
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import type { Stripe } from 'stripe'
import { stripe } from '@/lib/stripe/stripe'
import { updateUserCredits } from '@/db/actions'

const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
    console.log('Webhook received')
    const body = await req.text()
    const signature = headers().get('Stripe-Signature') as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        console.log('Event constructed:', event.type)
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.log(`❌ Error constructing event: ${errorMessage}`)
        return NextResponse.json({ message: `Webhook Error: ${errorMessage}` }, { status: 400 })
    }

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
                    console.log('Session details:', JSON.stringify(session, null, 2))

                    if (session.mode === 'payment' && session.payment_status === 'paid') {
                        const amountTotal = session.amount_total
                        const userId = session.client_reference_id

                        console.log(`Amount total: ${amountTotal}, User ID: ${userId}`)

                        if (amountTotal && userId) {
                            const creditsToAdd = Math.floor(amountTotal / 100) // Convert cents to dollars/credits
                            console.log(`Attempting to add ${creditsToAdd} credits to user ${userId}`)
                            const result = await updateUserCredits(userId, creditsToAdd)
                            console.log('Update result:', result)
                            if (result.success) {
                                console.log(`Added ${creditsToAdd} credits to user ${userId}. New balance: ${result.newBalance}`)
                            } else {
                                console.error(`Failed to add credits to user ${userId}: ${result.error}`)
                            }
                        } else {
                            console.log('Missing amount total or user ID')
                        }
                    } else {
                        console.log(`Unexpected session mode or payment status: ${session.mode}, ${session.payment_status}`)
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
                    console.log(`Unhandled event type: ${event.type}`)
            }
        } catch (error) {
            console.error('Error processing webhook:', error)
            return NextResponse.json(
                { message: "Webhook handler failed" },
                { status: 500 }
            )
        }
    } else {
        console.log(`Unhandled event type: ${event.type}`)
    }

    console.log('Webhook processed successfully')
    return NextResponse.json({ message: 'Received' }, { status: 200 })
}

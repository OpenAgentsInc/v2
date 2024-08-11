"use server";

import type { Stripe } from "stripe";

import { headers } from "next/headers";

import { CURRENCY } from "./config";
import { formatAmountForStripe } from "./stripe-helpers";
import { stripe } from "./stripe";

export async function createCheckoutSession(
    data: FormData,
): Promise<{ client_secret: string | null; url: string | null }> {
    const ui_mode = data.get(
        "uiMode",
    ) as Stripe.Checkout.SessionCreateParams.UiMode;

    const origin: string = headers().get("origin") as string;

    const checkoutSession: Stripe.Checkout.Session =
        await stripe.checkout.sessions.create({
            mode: "payment",
            submit_type: "pay",
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency: CURRENCY,
                        product_data: {
                            name: "OpenAgents Credits",
                        },
                        unit_amount: formatAmountForStripe(
                            Number(data.get("customAmount") as string),
                            CURRENCY,
                        ),
                    },
                },
            ],
            ...(ui_mode === "hosted" && {
                success_url: `${origin}/add-credits/result?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${origin}/add-credits`,
            }),
            ...(ui_mode === "embedded" && {
                return_url: `${origin}/add-credits/result?session_id={CHECKOUT_SESSION_ID}`,
            }),
            ui_mode,
        });

    return {
        client_secret: checkoutSession.client_secret,
        url: checkoutSession.url,
    };
}

export async function createPaymentIntent(
    data: FormData,
): Promise<{ client_secret: string }> {
    const paymentIntent: Stripe.PaymentIntent =
        await stripe.paymentIntents.create({
            amount: formatAmountForStripe(
                Number(data.get("customAmount") as string),
                CURRENCY,
            ),
            automatic_payment_methods: { enabled: true },
            currency: CURRENCY,
        });

    return { client_secret: paymentIntent.client_secret as string };
}
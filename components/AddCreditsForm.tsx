"use client";
import type Stripe from "stripe";
import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { formatAmountForDisplay, formatAmountForStripe } from "@/lib/stripe/stripe-helpers";
import { CURRENCY, MIN_AMOUNT, MAX_AMOUNT, AMOUNT_STEP } from "@/lib/stripe/config";
import { createCheckoutSession } from "@/lib/stripe/actions";
import getStripe from "@/lib/stripe/get-stripejs";
import {
    EmbeddedCheckout,
    EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";

interface AddCreditsFormProps {
    uiMode: Stripe.Checkout.SessionCreateParams.UiMode;
}

export default function AddCreditsForm(props: AddCreditsFormProps): JSX.Element {
    const [loading, setLoading] = useState<boolean>(false);
    const [amount, setAmount] = useState<number>(MIN_AMOUNT);
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    const formAction = async (data: FormData): Promise<void> => {
        setLoading(true);
        const uiMode = data.get(
            "uiMode"
        ) as Stripe.Checkout.SessionCreateParams.UiMode;
        const { client_secret, url } = await createCheckoutSession(data);
        if (uiMode === "embedded") {
            setClientSecret(client_secret);
        } else {
            window.location.assign(url as string);
        }
        setLoading(false);
    };

    return (
        <>
            <form action={formAction}>
                <input type="hidden" name="uiMode" value={props.uiMode} />
                <input type="hidden" name="customAmount" value={amount} />
                <div className="mb-4">
                    <Slider
                        id="amount"
                        min={MIN_AMOUNT}
                        max={MAX_AMOUNT}
                        step={AMOUNT_STEP}
                        value={[amount]}
                        onValueChange={(value) => setAmount(value[0])}
                        className="mt-1"
                    />
                </div>
                <button
                    className="px-4 py-2 bg-black text-white border border-white rounded hover:bg-white/10 transition-colors mt-4 w-full"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Processing..." : `Add ${formatAmountForDisplay(amount, CURRENCY)}`}
                </button>
            </form>
            {clientSecret && (
                <EmbeddedCheckoutProvider
                    stripe={getStripe()}
                    options={{ clientSecret }}
                >
                    <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
            )}
        </>
    );
}

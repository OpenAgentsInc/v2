"use client";

import type Stripe from "stripe";
import React, { useState } from "react";
import CustomDonationInput from "@/components/CustomDonationInput";
import { formatAmountForDisplay } from "@/lib/stripe/stripe-helpers";
import * as config from "@/lib/stripe/config";
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
    const [input, setInput] = useState<{ customAmount: number }>({
        customAmount: Math.round(config.MAX_AMOUNT / config.AMOUNT_STEP),
    });
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (
        e,
    ): void =>
        setInput({
            ...input,
            [e.currentTarget.name]: e.currentTarget.value,
        });

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
                <CustomDonationInput
                    className="checkout-style"
                    name="customAmount"
                    min={config.MIN_AMOUNT}
                    max={config.MAX_AMOUNT}
                    step={config.AMOUNT_STEP}
                    currency={config.CURRENCY}
                    onChange={handleInputChange}
                    value={input.customAmount}
                />
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mt-4 w-full"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Processing..." : `Add ${formatAmountForDisplay(input.customAmount, config.CURRENCY)} Credits`}
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
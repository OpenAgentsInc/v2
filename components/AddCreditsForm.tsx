"use client";

import type Stripe from "stripe";
import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
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
    const [credits, setCredits] = useState<number>(10);
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
                <input type="hidden" name="customAmount" value={credits * 100} />
                <div className="mb-4">
                    <label htmlFor="credits" className="block text-sm font-medium text-gray-700">
                        Credits to add
                    </label>
                    <Slider
                        id="credits"
                        min={1}
                        max={100}
                        step={1}
                        value={[credits]}
                        onValueChange={(value) => setCredits(value[0])}
                        className="mt-1"
                    />
                    <span className="mt-2 block text-sm text-gray-500">
                        {credits} credits ({formatAmountForDisplay(credits * 100, config.CURRENCY)})
                    </span>
                </div>
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mt-4 w-full"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Processing..." : `Add ${credits} Credits`}
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
import type { Metadata } from "next";
import "./styles.css";

import CheckoutForm from "@/components/CheckoutForm";

export const metadata: Metadata = {
    title: "Donate with hosted Checkout | Next.js + TypeScript Example",
};

export default function DonatePage(): JSX.Element {
    return (
        <div className="text-white absolute page-container z-[10001]">
            <h1>Donate with hosted Checkout</h1>
            <p>Donate to our project 💖</p>
            <CheckoutForm uiMode="hosted" />
        </div>
    );
}

"use client"
import ThemedImage from "./ThemedImage"

export default function HeroImage() {
    return (
        <section aria-label="Hero Image of the website" className="flow-root">
            <div className="rounded-2xl bg-black p-2 ring-1 ring-inset ring-white/10">
                <div className="rounded-xl bg-black ring-1 ring-white/15">
                    <ThemedImage
                        lightSrc="/images/demo2.png"
                        darkSrc="/images/demo2.png"
                        alt="A preview of the OpenAgents web app"
                        width={2400}
                        height={1600}
                        className="rounded-xl shadow-2xl shadow-white/50"
                    />
                </div>
            </div>
        </section>
    )
}

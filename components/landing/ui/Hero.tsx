import { RiPlayCircleFill } from "@remixicon/react"
import Link from "next/link"
import { Button } from "../Button"
import HeroImage from "./HeroImage"
import { SignUpButton } from "@clerk/nextjs"

export default function Hero() {
    return (
        <section
            aria-labelledby="hero-title"
            className="select-none font-mono mt-32 flex flex-col items-center justify-center text-center sm:mt-40 bg-black text-white"
        >
            <h1
                id="hero-title"
                className="font-mono font-extrabold inline-block animate-slide-up-fade bg-white bg-clip-text p-2 text-4xl tracking-tight text-transparent sm:text-6xl md:text-7xl"
                style={{ animationDuration: "700ms" }}
            >
                BUILD FASTER.
            </h1>
            <p
                className="font-mono mt-6 max-w-lg animate-slide-up-fade text-lg text-white"
                style={{ animationDuration: "900ms" }}
            >
                OpenAgents is your all-in-one<br />AI productivity dashboard.
            </p>
            <div
                className="mt-8 flex w-full animate-slide-up-fade flex-col justify-center gap-3 px-3 sm:flex-row"
                style={{ animationDuration: "1100ms" }}
            >
                <SignUpButton mode="modal">
                    <Button variant="primary" className="font-semibold bg-black border-white text-white hover:bg-white/10">
                        Try for free
                    </Button>
                </SignUpButton>
                <Button
                    asChild
                    variant="light"
                    className="group gap-x-2 bg-transparent font-semibold text-white hover:bg-black"
                >
                    <Link
                        href="https://x.com/OpenAgentsInc/status/1823109640357339628"
                        target="_blank"
                    >
                        <span className="mr-1 flex size-6 items-center justify-center rounded-full bg-white transition-all group-hover:bg-gray-200">
                            <RiPlayCircleFill
                                aria-hidden="true"
                                className="size-5 shrink-0 text-black"
                            />
                        </span>
                        Watch video
                    </Link>
                </Button>
            </div>
            <div
                className="relative mx-auto ml-3 mt-20 h-fit w-[40rem] max-w-6xl animate-slide-up-fade sm:ml-auto sm:w-full sm:px-2"
                style={{ animationDuration: "1400ms" }}
            >
                <HeroImage />
                <div
                    className="absolute inset-x-0 -bottom-20 -mx-10 h-2/4 bg-gradient-to-t from-black via-black to-transparent lg:h-1/4"
                    aria-hidden="true"
                />
            </div>
        </section>
    )
}

import CodeExample from "@/components/landing/ui/CodeExample"
import Cta from "@/components/landing/ui/Cta"
import Features from "@/components/landing/ui/Features"
import { GlobalDatabase } from "@/components/landing/ui/GlobalDatabase"
import Hero from "@/components/landing/ui/Hero"
import LogoCloud from "@/components/landing/ui/LogoCloud"

export default function Home() {
    return (
        <main className="flex flex-col overflow-hidden">
            <Hero />
            <LogoCloud />
            <GlobalDatabase />
            <CodeExample />
            <Features />
            <Cta />
        </main>
    )
}

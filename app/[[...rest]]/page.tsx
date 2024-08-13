import { SignedIn, SignedOut } from '@clerk/nextjs'
import { HomeAuthed } from '@/components/home'
import { Lander } from '@/components/landing/Lander'

export default function Page() {
    return (
        <>
            <SignedOut>
                <Lander />
            </SignedOut>
            <SignedIn>
                <HomeAuthed />
            </SignedIn>
        </>
    )
}

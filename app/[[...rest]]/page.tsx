import { SignedIn, SignedOut } from '@clerk/nextjs'
import { HomeAuthed, HomeUnauthed } from '@/components/home'

export default function Page() {
    return (
        <>
            <SignedOut>
                <HomeUnauthed />
            </SignedOut>
            <SignedIn>
                <HomeAuthed />
            </SignedIn>
        </>
    )
}


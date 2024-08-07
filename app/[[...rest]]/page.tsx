import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { HomeUnauthed } from '@/components/auth/HomeUnauthed'

export default function Page() {
    return (
        <>
            <SignedOut>
                <HomeUnauthed />
            </SignedOut>
            <SignedIn>
                <main className="h-screen flex items-center justify-center">
                    <UserButton />
                </main>
            </SignedIn>
        </>
    )
}


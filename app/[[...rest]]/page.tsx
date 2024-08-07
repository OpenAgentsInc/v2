import { SignedIn, SignedOut } from '@clerk/nextjs'
import { HomeUnauthed } from '@/components/auth/HomeUnauthed'
import { HomeDashboard } from '@/components/dashboard/HomeDashboard'

export default function Page() {
    return (
        <>
            <SignedOut>
                <HomeUnauthed />
            </SignedOut>
            <SignedIn>
                <HomeDashboard />
            </SignedIn>
        </>
    )
}


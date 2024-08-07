import { UserButton } from '@clerk/nextjs'

export const HomeDashboard = () => {
    return (
        <main className="h-screen flex items-center justify-center">
            <UserButton />
        </main>
    )
}

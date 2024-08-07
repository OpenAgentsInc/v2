import { UserButton } from '@clerk/nextjs'

export const HomeDashboard = () => {
    return (
        <main className="h-screen relative">
            <div className="absolute top-4 right-4">
                <UserButton />
            </div>
        </main>
    )
}

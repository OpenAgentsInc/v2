import { UserButton } from '@clerk/nextjs'
import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'

export const HomeDashboard = () => {
    return (
        <main className="h-screen relative">
            <div className="absolute top-4 right-4">
                <UserButton />
            </div>
            <div className="max-w-[500px] h-[800px]">
                <Chat id={nanoid()} />
            </div>
        </main>
    )
}


import { UserButton } from '@clerk/nextjs'
import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'

export const HomeDashboard = () => {
    return (
        <main className="h-screen flex items-center justify-center relative">
            <div className="absolute top-4 right-4">
                <UserButton />
            </div>
            <div className="w-[40%] h-[90%] border border-white rounded-xl overflow-hidden bg-gray-800 shadow-lg flex flex-col">
                <Chat id={nanoid()} className="flex-grow overflow-hidden" />
            </div>
        </main>
    )
}
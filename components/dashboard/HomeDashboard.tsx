import { Suspense } from 'react'
import { UserButton } from '@clerk/nextjs'
import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { Pane } from '@/components/hud/pane'
import { InitDatabase } from '@/components/db/InitDatabase'

export const HomeDashboard = () => {
    return (
        <main className="h-screen flex items-center justify-center relative">
            <Suspense fallback={null}>
                <InitDatabase />
            </Suspense>
            <div className="absolute top-4 right-4">
                <UserButton />
            </div>
            <div className="border border-white rounded-xl overflow-hidden shadow-lg flex flex-col">
                <Pane title="Chat" id="what" x={60} y={30} height={800} width={1000}>
                    <Chat id={nanoid()} className="flex-grow overflow-hidden" />
                </Pane>
            </div>
        </main>
    )
}

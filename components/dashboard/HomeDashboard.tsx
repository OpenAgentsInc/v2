import { UserButton } from '@clerk/nextjs'
import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { Pane } from '@/components/hud/pane'
import { ChatHistory } from '@/components/chat-history'

export const HomeDashboard = () => {
    return (
        <main className="h-screen flex items-center justify-center relative">
            <div className="absolute top-4 right-4">
                <UserButton />
            </div>
            <Pane title="Threads" id="sidebar" x={20} y={20} height={450} width={260}>
                <ChatHistory />
            </Pane>
            <Pane title="Chat" id="what" x={310} y={20} height={900} width={1000}>
                <Chat id={nanoid()} />
            </Pane>
        </main>
    )
}

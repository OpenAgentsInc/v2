"use client"

import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { Chat } from '@/components/chat'
import { Pane } from '@/components/hud/pane'
import { ChatHistory } from '@/components/chat-history'
import { useHudStore } from '@/store/hud'

export const HomeDashboard = () => {
    const { panes } = useHudStore()
    const userId = auth().userId

    if (!userId) {
        return <></>
    }

    return (
        <main className="h-screen flex items-center justify-center relative">
            <div className="absolute top-4 right-4">
                <UserButton />
            </div>
            <Pane title="Chat History" id="sidebar" x={20} y={20} height={450} width={260}>
                <ChatHistory userId={userId} />
            </Pane>
            {panes.map((pane) => (
                <Pane
                    key={pane.id}
                    title={pane.title}
                    id={pane.id}
                    x={pane.x}
                    y={pane.y}
                    height={pane.height}
                    width={pane.width}
                >
                    {pane.type === 'chat' && <Chat id={pane.id} />}
                </Pane>
            ))}
        </main>
    )
}
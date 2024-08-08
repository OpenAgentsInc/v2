"use server"

import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { Pane } from '@/components/hud/pane'
import { ChatHistory } from '@/components/chat-history'
import { HUD } from '@/components/hud/hud'

export const HomeDashboard = async () => {
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
            <HUD />
        </main>
    )
}
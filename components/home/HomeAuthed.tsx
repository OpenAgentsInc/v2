"use server"

import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { Balance } from '@/components/hud/balance'
import { Hud } from '@/components/hud/hud'
import { Pane } from '@/components/hud/pane'
import { ChatHistory } from '@/components/sidebar/chat-history'

export const HomeAuthed = async () => {
    const userId = auth().userId
    if (!userId) {
        return <></>
    }
    return (
        <main className="h-screen flex items-center justify-center relative">
            <div className="absolute top-4 right-4">
                <UserButton />
            </div>
            <Pane title="Chat History" id={0} x={20} y={20} height={450} width={260} dismissable={false}>
                <ChatHistory userId={userId} />
            </Pane>
            <Balance />
            <Hud />
        </main>
    )
}

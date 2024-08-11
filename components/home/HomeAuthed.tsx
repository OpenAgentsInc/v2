"use server"

import { auth } from '@clerk/nextjs/server'
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
            <Pane title="Chat History" id={0} x={10} y={150} height={450} width={260} dismissable={false}>
                <ChatHistory userId={userId} />
            </Pane>
            <Hud />
        </main>
    )
}

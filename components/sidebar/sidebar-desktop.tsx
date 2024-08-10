"use server"

import { Sidebar } from './sidebar'
import { ChatHistory } from './chat-history'
import { auth } from '@clerk/nextjs/server'

export async function SidebarDesktop() {
    const userId = auth().userId

    if (!userId) {
        return null
    }

    return (
        <Sidebar className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]">
            <ChatHistory userId={userId} />
        </Sidebar>
    )
}

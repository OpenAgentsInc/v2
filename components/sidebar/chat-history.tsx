import * as React from 'react'

import { SidebarList } from './sidebar-list'
import { NewChatButton } from './new-chat-button'

interface ChatHistoryProps {
    userId: string
}

export async function ChatHistory({ userId }: ChatHistoryProps) {
    return (
        <div className="flex flex-col h-full">
            <div className="mt-2 mb-2 px-2">
                <NewChatButton />
            </div>
            <React.Suspense
                fallback={
                    <div className="flex flex-col flex-1 px-4 space-y-4 overflow-auto">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-full h-6 rounded-md shrink-0 animate-pulse bg-zinc-200 dark:bg-zinc-800"
                            />
                        ))}
                    </div>
                }
            >
                {/* @ts-ignore */}
                <SidebarList userId={userId} />
            </React.Suspense>
        </div>
    )
}

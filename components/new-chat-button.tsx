'use client'

import { useHudStore } from '@/store/hud'
import { useChatStore } from '@/store/chat'
import { buttonVariants } from '@/components/ui/button'
import { IconPlus } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

export function NewChatButton() {
    const { addPane } = useHudStore()
    const { setCurrentThreadId, setMessages } = useChatStore()

    const handleNewChat = () => {
        setCurrentThreadId(null)
        setMessages(null, [])
        addPane({
            type: 'chat',
            title: 'New Chat',
            x: 300,
            y: 20,
            width: 600,
            height: 400
        })
    }

    return (
        <button
            onClick={handleNewChat}
            className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-10 w-full justify-start bg-zinc-50 px-4 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10'
            )}
        >
            <IconPlus className="-translate-x-2 stroke-2" />
            New Chat
        </button>
    )
}
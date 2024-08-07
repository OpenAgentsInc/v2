'use client'

import { Sidebar } from '@/components/sidebar'
import { ChatHistory } from '@/components/chat-history'
import { useSidebarStore } from '@/store/sidebar'

interface SidebarContentProps {
    userId: string
}

export function SidebarContent({ userId }: SidebarContentProps) {
    const isOpen = useSidebarStore((state) => state.isOpen)

    return (
        <Sidebar
            className={`peer absolute inset-y-0 z-30 border-r bg-muted duration-300 ease-in-out lg:flex lg:w-[250px] xl:w-[300px] ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            <ChatHistory userId={userId} />
        </Sidebar>
    )
}

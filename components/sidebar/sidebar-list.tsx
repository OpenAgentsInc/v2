'use client'

import * as React from 'react'
import { Chat } from '@/types'
import { SidebarItems } from '@/components/sidebar/sidebar-items'
import { Id } from '@/convex/_generated/dataModel'
import { ServerActionResult } from '@/types'

interface SidebarListProps {
  chats: Chat[] | undefined
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>
  newChatId: Id<'threads'> | null
  removeChat: (args: { id: Id<'threads'>; path: string }) => Promise<ServerActionResult<void>>
  shareChat: (args: { id: Id<'threads'> }) => Promise<ServerActionResult<string>>
}

export function SidebarList({ chats, setChats, newChatId, removeChat, shareChat }: SidebarListProps) {
  return (
    <div className="flex-1 overflow-auto">
      {chats?.length ? (
        <div className="space-y-2 px-2">
          <SidebarItems
            chats={chats}
            setChats={setChats}
            newChatId={newChatId}
            removeChat={removeChat}
            shareChat={shareChat}
          />
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No chat history</p>
        </div>
      )}
    </div>
  )
}

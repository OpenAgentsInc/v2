'use client'

import * as React from 'react'
import { SidebarItem } from './sidebar-item'
import { Chat } from '@/types'
import { Id } from '@/convex/_generated/dataModel'
import { ServerActionResult } from '@/types'

interface SidebarListProps {
  chats: Chat[]
  setChats: (chats: Chat[]) => void
  newChatId: Id<'threads'> | null
  removeChat: (args: { id: Id<'threads'>; path: string }) => Promise<ServerActionResult<void>>
  shareChat: (args: { id: Id<'threads'> }) => Promise<ServerActionResult<string>>
}

export function SidebarList({
  chats,
  setChats,
  newChatId,
  removeChat,
  shareChat
}: SidebarListProps) {
  const handleDelete = async (chatId: Id<'threads'>) => {
    const chatToDelete = chats.find(chat => chat.id === chatId)
    if (chatToDelete) {
      await removeChat({ id: chatId, path: chatToDelete.path })
      setChats(chats.filter(chat => chat.id !== chatId))
    }
  }

  return (
    <div className="flex-1 overflow-auto">
      {chats.map((chat, index) => (
        <SidebarItem
          key={chat.id}
          chat={chat}
          isNew={chat.id === newChatId}
          index={index}
          onDelete={handleDelete}
        >
          {/* Additional actions can be added here */}
        </SidebarItem>
      ))}
    </div>
  )
}
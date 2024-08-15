'use client'

import * as React from 'react'
import { SidebarItem } from './sidebar-item'
import { Chat } from '@/types'
import { Id } from '@/convex/_generated/dataModel'
import { ServerActionResult } from '@/types'
import { toast } from 'sonner'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

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
  const deleteThread = useMutation(api.threads.deleteThread)

  const handleDelete = async (chatId: Id<'threads'>) => {
    const chatToDelete = chats.find(chat => chat.id === chatId)
    if (chatToDelete) {
      try {
        const result = await deleteThread({ thread_id: chatId })
        if (result.success) {
          setChats(chats.filter(chat => chat.id !== chatId))
          toast.success('Chat deleted successfully')
        } else if (result.reason === 'not_found') {
          // If the thread wasn't found in the database, still remove it from the UI
          setChats(chats.filter(chat => chat.id !== chatId))
          toast.success('Chat removed from list')
        } else {
          toast.error('Failed to delete chat. Please try again.')
        }
      } catch (error) {
        console.error('Error deleting chat:', error)
        toast.error('An unexpected error occurred. Please try again.')
      }
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
          <button onClick={() => shareChat({ id: chat.id })}>Share</button>
        </SidebarItem>
      ))}
    </div>
  )
}
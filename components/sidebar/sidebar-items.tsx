'use client'

import { Chat } from '@/types'
import { SidebarActions } from '@/components/sidebar/sidebar-actions'
import { SidebarItem } from '@/components/sidebar/sidebar-item'
import { Id } from '@/convex/_generated/dataModel'
import { ServerActionResult } from '@/types'

interface SidebarItemsProps {
  chats?: Chat[]
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>
  removeChat: (args: { id: Id<'threads'>; path: string }) => Promise<ServerActionResult<void>>
  shareChat: (args: { id: Id<'threads'> }) => Promise<ServerActionResult<string>>
  newChatId: Id<'threads'> | null
}

export function SidebarItems({ chats, setChats, removeChat, shareChat, newChatId }: SidebarItemsProps) {
  if (!chats?.length) return null

  const handleDelete = async (chatId: Id<'threads'>) => {
    await removeChat({ id: chatId, path: '' }) // Assuming path is not needed for deletion
    setChats(prevChats => prevChats.filter(chat => chat.id !== chatId))
  }

  return (
    <div className="flex-1 overflow-auto">
      {chats.map((chat, index) => (
        <SidebarItem 
          key={chat.id} 
          chat={chat} 
          index={index} 
          isNew={chat.id === newChatId}
          onDelete={handleDelete}
        >
          <SidebarActions
            chat={chat}
            removeChat={removeChat}
            shareChat={shareChat}
          />
        </SidebarItem>
      ))}
    </div>
  )
}
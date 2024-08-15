'use client'

import { Chat } from '@/types'
import { SidebarActions } from '@/components/sidebar/sidebar-actions'
import { SidebarItem } from '@/components/sidebar/sidebar-item'
import { Id } from '@/convex/_generated/dataModel'

interface SidebarItemsProps {
  chats?: Chat[]
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>
  removeChat: (args: { id: Id<'threads'>; path: string }) => Promise<{ success: boolean; error?: string }>
  shareChat: (args: { id: Id<'threads'> }) => Promise<{ success: boolean; data?: string; error?: string }>
}

export function SidebarItems({ chats, setChats, removeChat, shareChat }: SidebarItemsProps) {
  if (!chats?.length) return null

  return (
    <div className="flex-1 overflow-auto">
      {chats.map(chat => (
        <SidebarItem key={chat.id} chat={chat}>
          <SidebarActions
            chat={chat}
            removeChat={async ({ id, path }) => {
              const result = await removeChat({ id, path })
              if (result.success) {
                setChats(prevChats => prevChats.filter(chat => chat.id !== id))
              }
              return result
            }}
            shareChat={shareChat}
          />
        </SidebarItem>
      ))}
    </div>
  )
}
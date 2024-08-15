'use client'

import { Chat } from '@/types'
import { SidebarActions } from '@/components/sidebar/sidebar-actions'
import { SidebarItem } from '@/components/sidebar/sidebar-item'
import { removeChat, shareChat } from '@/app/actions'
import { Id } from '@/convex/_generated/dataModel'

interface SidebarItemsProps {
  chats?: Chat[]
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>
}

export function SidebarItems({ chats, setChats }: SidebarItemsProps) {
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
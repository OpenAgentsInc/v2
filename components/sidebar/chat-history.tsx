'use client'

import * as React from 'react'
import { SidebarList } from './sidebar-list'
import { NewChatButton } from './new-chat-button'
import { Chat } from '@/types'
import { useChatStore } from '@/store/chat'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { ServerActionResult } from '@/types'
import { useUser } from "@clerk/nextjs";

interface ChatHistoryProps {
  clerkUserId: string
}

export function ChatHistory({ clerkUserId }: ChatHistoryProps) {
  const { threads, setThread } = useChatStore()
  const [isLoading, setIsLoading] = React.useState(true)
  const [newChatId, setNewChatId] = useLocalStorage<Id<'threads'> | null>('newChatId2', null)
  const { user } = useUser();

  const fetchedThreads = useQuery(api.threads.getUserThreads, { clerk_user_id: clerkUserId })
  const removeThreadMutation = useMutation(api.threads.deleteThread)
  const shareThreadMutation = useMutation(api.threads.shareThread)

  React.useEffect(() => {
    if (fetchedThreads) {
      fetchedThreads.forEach((thread) => {
        setThread(thread._id, {
          id: thread._id,
          title: (thread.metadata as { title?: string })?.title || 'Untitled Thread',
          messages: [],
          createdAt: new Date(thread.createdAt),
        })
      })
      setIsLoading(false)
    }
  }, [fetchedThreads, setThread])

  const addChat = React.useCallback((newChat: Chat) => {
    setThread(newChat.id, {
      id: newChat.id,
      title: newChat.title,
      messages: [],
      createdAt: new Date(),
    })
    setNewChatId(newChat.id)
  }, [setThread, setNewChatId])

  const removeChat = React.useCallback(async (args: { id: Id<'threads'>; path: string }): Promise<ServerActionResult<void>> => {
    await removeThreadMutation({ thread_id: args.id })
    // Update local state or trigger a refetch
    return { success: true, data: undefined }
  }, [removeThreadMutation])

  const shareChat = React.useCallback(async (args: { id: Id<'threads'> }): Promise<ServerActionResult<string>> => {
    const result = await shareThreadMutation({ thread_id: args.id })
    return { success: true, data: result }
  }, [shareThreadMutation])

  const sortedChats = React.useMemo(() => {
    return Object.values(threads)
      .sort((a, b) => {
        const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return timeB - timeA;
      })
      .map(thread => ({
        id: thread.id,
        title: thread.title,
        path: `/chat/${thread.id}`,
        createdAt: thread.createdAt,
        messages: thread.messages,
        userId: thread.userId,
      }))
  }, [threads])

  return (
    <div className="flex flex-col h-full">
      <div className="mt-2 mb-2 px-2">
        <NewChatButton 
          addChat={addChat} 
          clerkUserId={clerkUserId} 
          userEmail={user?.emailAddresses[0]?.emailAddress || ''}
          userImage={user?.imageUrl}
          chats={sortedChats as Chat[]} 
        />
      </div>
      {isLoading ? (
        <div className="flex flex-col flex-1 px-4 space-y-4 overflow-auto">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-6 rounded-md shrink-0 animate-pulse bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>
      ) : (
        <SidebarList
          chats={sortedChats as Chat[]}
          setChats={() => {}}
          newChatId={newChatId}
          removeChat={removeChat}
          shareChat={shareChat}
        />
      )}
    </div>
  )
}
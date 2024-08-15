'use client'

import * as React from 'react'
import { SidebarList } from './sidebar-list'
import { NewChatButton } from './new-chat-button'
import { Chat } from '@/types'
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
  const [newChatId, setNewChatId] = useLocalStorage<Id<'threads'> | null>('newChatId2', null)
  const { user } = useUser();

  const threads = useQuery(api.threads.getUserThreads, { clerk_user_id: clerkUserId })
  const removeThreadMutation = useMutation(api.threads.deleteThread)
  const shareThreadMutation = useMutation(api.threads.shareThread)
  const createNewThreadMutation = useMutation(api.threads.createNewThread)

  const addChat = React.useCallback(async (newChat: Chat) => {
    const result = await createNewThreadMutation({
      clerk_user_id: clerkUserId,
      metadata: { title: newChat.title }
    })
    if (result) {
      setNewChatId(result._id)
    }
  }, [createNewThreadMutation, clerkUserId, setNewChatId])

  const removeChat = React.useCallback(async (args: { id: Id<'threads'>; path: string }): Promise<ServerActionResult<void>> => {
    const result = await removeThreadMutation({ thread_id: args.id })
    return { success: result.success, data: undefined }
  }, [removeThreadMutation])

  const shareChat = React.useCallback(async (args: { id: Id<'threads'> }): Promise<ServerActionResult<string>> => {
    const result = await shareThreadMutation({ thread_id: args.id })
    return { success: true, data: result }
  }, [shareThreadMutation])

  const sortedChats = React.useMemo(() => {
    if (!threads) return []
    return threads
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(thread => {
        const threadId = thread._id.toString()
        return {
          id: threadId,
          title: (thread.metadata as { title?: string })?.title || 'Untitled Thread',
          path: `/chat/${threadId}`,
          createdAt: new Date(thread.createdAt),
          messages: [], // You might want to fetch messages separately if needed
          userId: clerkUserId,
        }
      })
  }, [threads, clerkUserId])

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
      {threads === undefined ? (
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
          setChats={() => { }}
          newChatId={newChatId}
          removeChat={removeChat}
          shareChat={shareChat}
        />
      )}
    </div>
  )
}

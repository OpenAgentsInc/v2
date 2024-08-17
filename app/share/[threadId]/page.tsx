"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { formatDate } from "@/lib/utils"
import { ChatList } from "@/panes/chat/ChatList"
import { Message } from "@/types"

export const runtime = 'edge'
export const preferredRegion = 'home'

interface SharePageProps {
  params: {
    threadId: string
  }
}

export default function SharePage({ params }: SharePageProps) {
  const chat = useQuery(api.threads.getSharedThread.getSharedThread, { threadId: params.threadId as Id<'threads'> })
  const messages = useQuery(api.threads.getThreadMessages.getThreadMessages, { threadId: params.threadId as Id<'threads'> })

  if (!chat || !chat?.isShared) {
    return <></>
  }

  if (!messages) {
    return <p>No messages</p>
  }

  return (
    <>
      <div className="flex-1 space-y-6">
        <div className="border-b bg-background px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-2xl">
            <div className="space-y-1 md:-mx-8">
              <h1 className="text-2xl font-bold">{chat.metadata?.title || "Untitled Chat"}</h1>
              <div className="text-sm text-muted-foreground">
                {formatDate(chat.createdAt)} · {messages.length} messages
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-3xl">
        <ChatList messages={messages as Message[]} />
      </div>
    </>
  )
}

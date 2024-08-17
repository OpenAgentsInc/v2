"use client"

import { useQuery } from "convex/react"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Providers } from "@/components/providers"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useChat } from "@/hooks/useChat"
import { formatDate } from "@/lib/utils"
import { ChatList } from "@/panes/chat/ChatList"

export const runtime = 'edge'
export const preferredRegion = 'home'

interface SharePageProps {
  params: {
    threadId: string
  }
}

// export async function generateMetadata({
//   params
// }: SharePageProps): Promise<Metadata> {
//   const chat = await getSharedChat(params.id)

//   return {
//     title: chat?.title.slice(0, 50) ?? 'Chat'
//   }
// }

export default function SharePage({ params }: SharePageProps) {
  const chat = useQuery(api.threads.getSharedThread.getSharedThread, { threadId: params.threadId as Id<'threads'> })
  const { messages } = useChat({ propsId: params.threadId as Id<'threads'> })
  console.log("SharePage chat:", chat)

  if (!chat || !chat?.isShared) {
    // notFound()
    return <></>
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
        <ChatList messages={messages} />
      </div>
    </>
  )
}

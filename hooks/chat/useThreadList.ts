import { useQuery } from "convex/react"
import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"
import { Thread, ThreadMetadata } from "./types"

export function useThreadList() {
  const { user } = useUser()
  return
  const getUserThreads = useQuery(api.threads.getUserThreads.getUserThreads, user ? { clerk_user_id: user.id } : "skip")
  const [threads, setThreads] = useState<Array<{
    id: Id<"threads">,
    title: string,
    lastMessagePreview: string,
    createdAt: string,
  }>>([])

  useEffect(() => {
    if (getUserThreads) {
      setThreads(getUserThreads.map((thread) => ({
        id: thread._id,
        title: (thread.metadata as ThreadMetadata)?.title || 'New Chat',
        lastMessagePreview: (thread.metadata as ThreadMetadata)?.lastMessagePreview || '',
        createdAt: thread.createdAt ? new Date(thread.createdAt).toISOString() : new Date().toISOString(),
      })))
    }
  }, [getUserThreads])

  return threads
}

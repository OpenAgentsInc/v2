import { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useUser } from '@clerk/nextjs'
import { Id } from '../../convex/_generated/dataModel'
import { Thread, ThreadMetadata } from './types'

export function useThreadList() {
  const { user } = useUser()
  const getUserThreads = useQuery(api.threads.getUserThreads.getUserThreads, user ? { clerk_user_id: user.id } : "skip")
  const [threads, setThreads] = useState<Array<{
    id: Id<"threads">,
    title: string,
    lastMessagePreview: string,
    createdAt: string,
  }>>([])

  useEffect(() => {
    if (getUserThreads) {
      setThreads(getUserThreads.map((thread: Thread) => ({
        id: thread._id,
        title: (thread.metadata as ThreadMetadata)?.title || 'New Chat',
        lastMessagePreview: (thread.metadata as ThreadMetadata)?.lastMessagePreview || '',
        createdAt: thread.createdAt,
      })))
    }
  }, [getUserThreads])

  return threads
}

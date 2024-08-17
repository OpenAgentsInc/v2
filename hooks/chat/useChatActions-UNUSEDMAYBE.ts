import { useMutation } from "convex/react"
import { useCallback } from "react"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"
import { useChatStore } from "../../store/chat"

export function useChatActions() {
  const { user } = useUser()
  const createNewThread = useMutation(api.threads.createNewThread.createNewThread)
  const { setCurrentThreadId } = useChatStore()

  const handleCreateNewThread = useCallback(async () => {
    console.log("nah")
    return
    if (!user) return null

    try {
      const newThread = await createNewThread({
        clerk_user_id: user.id,
        metadata: {},
      })

      if (newThread && typeof newThread === 'string') {
        const threadId = newThread as Id<"threads">
        setCurrentThreadId(threadId)
        return threadId
      } else {
        console.error('Unexpected thread response:', newThread)
        return null
      }
    } catch (error) {
      console.error('Error creating new thread:', error)
      toast.error('Failed to create a new chat thread. Please try again.')
      return null
    }
  }, [user, createNewThread, setCurrentThreadId])

  return {
    createNewThread: handleCreateNewThread,
  }
}

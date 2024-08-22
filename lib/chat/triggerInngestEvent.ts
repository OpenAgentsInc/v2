"use server"

import { inngest } from "@/inngest/client"
import { Repo } from "@/types"

interface TriggerInngestEventProps {
  content: string
  modelId: string
  repo: Repo | null
  threadId: string
  userId: string
}

export async function triggerInngestEvent({ content, modelId, repo, threadId, userId }: TriggerInngestEventProps) {
  await inngest.send({
    name: "chat/process.message",
    data: {
      content,
      modelId,
      repo,
      threadId,
      userId,
    }
  })
}

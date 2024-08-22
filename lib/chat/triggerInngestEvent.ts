"use server"

import { inngest } from "@/inngest/client"

interface TriggerInngestEventProps {
  content: string
  modelId: string
  threadId: string
  userId: string
}

export async function triggerInngestEvent({ content, modelId, threadId, userId }: TriggerInngestEventProps) {
  await inngest.send({
    name: "chat/process.message",
    data: {
      content,
      modelId,
      threadId,
      userId,
    }
  })
}

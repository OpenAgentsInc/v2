"use server"

import { inngest } from "@/inngest/client"

interface TriggerInngestEventProps {
  threadId: string
  userId: string
  content: string
}

export async function triggerInngestEvent({ threadId, userId, content }: TriggerInngestEventProps) {
  await inngest.send({
    name: "chat/process.message",
    data: {
      threadId,
      userId,
      content,
    }
  })
}
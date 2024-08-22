"use server"

import { inngest } from "@/inngest/client"
import { Repo } from "@/types"

interface TriggerInngestEventProps {
  content: string
  githubToken?: string
  modelId: string
  repo: Repo | null
  threadId: string
  userId: string
}

export async function triggerInngestEvent(data: TriggerInngestEventProps) {
  await inngest.send({
    name: "chat/process.message",
    data
  })
}

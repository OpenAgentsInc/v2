"use server"

import { Repo } from "@/types"
import { authenticateUser } from "./authenticateUser"
import { triggerInngestEvent } from "./triggerInngestEvent"

interface SendMessageProps {
  modelId: string
  repo: Repo | null
  text: string
  threadId: string
}

export async function sendMessage({ modelId, repo, text, threadId }: SendMessageProps) {
  const user = await authenticateUser()

  await triggerInngestEvent({
    content: text,
    modelId,
    repo,
    threadId,
    userId: user.id,
  })

  return { success: true }
}

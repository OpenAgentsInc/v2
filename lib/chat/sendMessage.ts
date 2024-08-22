"use server"

import { Repo } from "@/types"
import { getGitHubToken } from "../github/isGitHubUser"
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
  const githubToken = await getGitHubToken(user) ?? undefined

  await triggerInngestEvent({
    content: text,
    githubToken,
    modelId,
    repo,
    threadId,
    userId: user.id,
  })

  return { success: true }
}

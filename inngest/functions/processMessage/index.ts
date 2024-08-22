import { inngest } from "@/inngest/client"
import { Repo } from "@/types"
import { gatherContext } from "./gatherContext"
import { infer } from "./infer"
import { saveUserMessage } from "./saveUserMessage"

export interface ProcessMessageData {
  content: string
  githubToken?: string
  modelId: string
  repo: Repo | null
  threadId: string
  userId: string
}

export const processMessage = inngest.createFunction(
  { id: "process-message", name: "Process Message" },
  { event: "chat/process.message" },
  async ({ event, step, logger }) => {
    const { content, githubToken, modelId, repo, threadId, userId } = event.data as ProcessMessageData;

    // Save user message to Convex database
    await step.run("Save User Message", async () => {
      return await saveUserMessage({ content, threadId, userId });
    });

    // Collect relevant message history and tools
    const { messages, tools } = await step.run("Gather Context", async () => {
      return await gatherContext({ content, threadId, userId })
    });

    // Send message, context, and tools to LLM
    const response = await step.run("LLM Inference", async () => {
      return await infer({ githubToken, logger, messages, modelId, repo, tools, threadId, userId })
    });

    return { assistantMessage: response.result };
  }
);
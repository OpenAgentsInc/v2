import { inngest } from "@/inngest/client"
import { Repo } from "@/types"
import { gatherContext } from "./gatherContext"
import { infer } from "./infer"
import { saveAssistantMessage } from "./saveAssistantMessage"
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
  async ({ event, step }) => {
    const { content, githubToken, modelId, repo, threadId, userId } = event.data as ProcessMessageData; // must confirm this can take a Repo

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
      return await infer({ githubToken, messages, modelId, repo, tools })
    });

    // Save processed message
    const assistantMessage = await step.run("Save Processed Message", async () => {
      return await saveAssistantMessage({
        content: response.text,
        finishReason: response.finishReason,
        toolCalls: response.toolCalls,
        toolResults: response.toolResults,
        modelId, threadId,
        usage: {
          completion_tokens: response.usage.completionTokens,
          prompt_tokens: response.usage.promptTokens,
          total_tokens: response.usage.totalTokens
        },
        userId
      });
    });

    return { assistantMessage };
  }
);

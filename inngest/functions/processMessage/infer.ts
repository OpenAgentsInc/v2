import { streamText } from "ai"
import { Logger } from "inngest/middleware/logger"
import { getSystemPrompt } from "@/lib/systemPrompt"
import { getToolContext, getTools, ToolName } from "@/tools"
import { OnChunkResult, OnFinishResult, Repo } from "@/types"
import { createOrUpdateAssistantMessage } from "./saveAssistantMessage"

interface InferProps {
  githubToken?: string
  logger: Logger
  messages: any[]
  modelId: string
  repo: Repo | null
  tools: ToolName[]
  threadId: string
  userId: string
}

export async function infer({ githubToken, logger, messages, modelId, repo, tools: bodyTools, threadId, userId }: InferProps) {
  logger.info("Test.")
  const toolContext = await getToolContext({ githubToken, modelId, repo });
  const tools = getTools(toolContext, bodyTools);
  const { textStream, finishReason, usage } = await streamText({
    messages,
    model: toolContext.model,
    system: getSystemPrompt(toolContext),
    tools,
    onChunk: async (event: OnChunkResult) => {
      logger.info("Chunk received:", event);
      const chunk = event.chunk;

      switch (chunk.type) {
        case 'text-delta':
          await createOrUpdateAssistantMessage({
            content: chunk.textDelta,
            modelId,
            threadId,
            userId,
            isPartial: true,
          });
          break;
        case 'tool-call-streaming-start':
        case 'tool-call-delta':
        case 'tool-call':
          await createOrUpdateAssistantMessage({
            content: '',
            modelId,
            threadId,
            userId,
            toolCalls: chunk,
            isPartial: true,
          });
          break;
      }
    },
    onFinish: (result: OnFinishResult) => {
      logger.info("Finish reason:", result);
    }
  });

  // Collect the full response
  let fullResponse = '';
  for await (const chunk of textStream) {
    fullResponse += chunk;
  }

  logger.info("Full response is:", fullResponse);
  logger.info("Usage is:", usage);

  // Save the final message
  await createOrUpdateAssistantMessage({
    content: fullResponse,
    modelId,
    threadId,
    userId,
    usage,
    finishReason,
    isPartial: false,
  });

  return {
    result: fullResponse,
    finishReason,
    usage
  };
}
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
    onChunk: async (event: { chunk: OnChunkResult['chunk'] }) => {
      logger.info("Chunk received:", event);
      const chunk = event.chunk;

      if (chunk.type === 'text-delta') {
        await createOrUpdateAssistantMessage({
          content: chunk.textDelta,
          modelId,
          threadId,
          userId,
          isPartial: true,
        });
      } else if (chunk.type === 'tool-call') {
        await createOrUpdateAssistantMessage({
          content: '',
          modelId,
          threadId,
          userId,
          toolCalls: chunk,
          isPartial: true,
        });
      } else if (chunk.type === 'tool-result') {
        await createOrUpdateAssistantMessage({
          content: '',
          modelId,
          threadId,
          userId,
          toolResults: chunk,
          isPartial: true,
        });
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
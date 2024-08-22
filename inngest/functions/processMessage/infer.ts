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
    onChunk: async (chunk: OnChunkResult) => {
      logger.info("Chunk received:", chunk);
      await createOrUpdateAssistantMessage({
        content: chunk.chunk.type === 'text-delta' ? chunk.chunk.textDelta : '',
        modelId,
        threadId,
        userId,
        toolCalls: chunk.chunk.type === 'tool-call' ? chunk.chunk : undefined,
        toolResults: chunk.chunk.type === 'tool-result' ? chunk.chunk : undefined,
        isPartial: true,
      });
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

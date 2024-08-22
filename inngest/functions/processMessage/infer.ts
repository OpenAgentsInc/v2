import { streamText } from "ai"
import { Logger } from "inngest/middleware/logger"
import { getSystemPrompt } from "@/lib/systemPrompt"
import { getToolContext, getTools, ToolName } from "@/tools"
import { Repo } from "@/types"

interface InferProps {
  githubToken?: string
  logger: Logger
  messages: any[]
  modelId: string
  repo: Repo | null
  tools: ToolName[]
}

export async function infer({ githubToken, logger, messages, modelId, repo, tools: bodyTools }: InferProps) {
  logger.info("Test.")
  const toolContext = await getToolContext({ githubToken, modelId, repo });
  const tools = getTools(toolContext, bodyTools);
  const { textStream, text, finishReason, usage } = await streamText({
    messages,
    model: toolContext.model,
    system: getSystemPrompt(toolContext),
    tools,
    onChunk: (chunk) => {
      // Console log each chunk
      logger.info("Chunk received:", chunk);
    },
    onFinish: (reason) => {
      // Console log the finish reason
      logger.info("Finish reason:", reason);
    }
  });

  // Collect the full response
  let fullResponse = '';
  for await (const chunk of textStream) {
    fullResponse += chunk;
  }

  logger.info("Text is:", text);
  logger.info("Full response is:", fullResponse);
  logger.info("Usage is:", usage);

  return {
    result: fullResponse,
    finishReason,
    usage
  };
}

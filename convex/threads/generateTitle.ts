import { generateText } from "ai"
import { v } from "convex/values"
import { models } from "@/lib/models"
import { openai } from "@ai-sdk/openai"
import { api } from "../_generated/api"
import { Doc, Id } from "../_generated/dataModel"
import { action, ActionCtx } from "../_generated/server"

export const generateTitle = action({
  args: { threadId: v.id("threads") },
  async handler(ctx: ActionCtx, args: { threadId: Id<"threads"> }): Promise<string> {
    const messages = await ctx.runQuery(api.threads.getThreadMessages.getThreadMessages, args);

    if (messages.length === 0) {
      return "New Thread";
    }

    const formattedMessages = messages
      .map((msg: Doc<"messages">) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const modelObj = models.find((m) => m.name === "GPT-4o Mini");
    if (!modelObj) {
      throw new Error("Model not found");
    }

    const { text } = await generateText({
      model: openai(modelObj.id),
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates concise and relevant titles for chat conversations.",
        },
        {
          role: "user",
          content: `Please generate a short, concise title (5 words or less) for the following conversation. Do not wrap it in quotes, just the text:\n\n${formattedMessages}`,
        },
      ],
      temperature: 0.7,
      maxTokens: 10,
    });

    const generatedTitle = text.trim();

    await ctx.runMutation(api.threads.updateThreadData.updateThreadData, {
      thread_id: args.threadId,
      metadata: { title: generatedTitle },
    });

    return generatedTitle;
  },
});

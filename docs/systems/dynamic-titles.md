# Dynamic Title Generation

After the first message is received from an assistant, a dynamic title should be generated via OpenAI.

## Implementation

The dynamic title generation is now implemented using Convex functions. Here's an overview of the process:

1. The `generateTitle` function is defined in `convex/threads.ts`:

```typescript
export const generateTitle = mutation({
  args: { threadId: v.id("threads") },
  async handler(ctx, args) {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_thread_id", (q) => q.eq("thread_id", args.threadId))
      .order("asc")
      .collect();

    if (messages.length === 0) {
      return "New Thread";
    }

    const formattedMessages = messages
      .map((msg) => `${msg.role}: ${msg.content}`)
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
          content: `Please generate a short, concise title (5 words or less) for the following conversation:\n\n${formattedMessages}`,
        },
      ],
      temperature: 0.7,
      maxTokens: 10,
    });

    const generatedTitle = text.trim();

    await ctx.db.patch(args.threadId, {
      metadata: { title: generatedTitle },
    });

    return generatedTitle;
  },
});
```

2. The `useChat` hook in `hooks/useChat.ts` calls this function after the first assistant message:

```typescript
if (updatedMessages.length === 1 && updatedMessages[0].role === 'assistant') {
  try {
    const title = await generateTitle({ threadId });
    setThreadData({ ...threadData, title });
  } catch (error) {
    console.error('Error generating title:', error);
  }
}
```

## Deployment

To ensure the `generateTitle` function is available, make sure to deploy the updated Convex functions using:

```
npx convex deploy
```

## Troubleshooting

If you encounter the error "Could not find public function for 'threads:generateTitle'", it usually means that the Convex functions haven't been deployed after making changes. Always run `npx convex deploy` after modifying Convex functions.

## Future Improvements

1. Implement error handling and retries for title generation.
2. Add a way to manually trigger title regeneration.
3. Optimize the title generation process for longer conversations.
4. Consider caching generated titles to reduce API calls.

Remember to keep this document updated as the implementation evolves.
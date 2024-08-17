# Dynamic Title Generation and Animation

After the first message is received from an assistant, a dynamic title should be generated via OpenAI. When a chat's title is updated, an animation is triggered to highlight the change.

## Implementation

The dynamic title generation is implemented using Convex functions, and the animation is handled in the React components.

### Title Generation

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

### Title Update Animation

The animation for updated chat titles is implemented in the `ChatsPane` and `ChatItem` components.

1. In `panes/chats/ChatsPane.tsx`:

```typescript
const UPDATED_CHATS_KEY = 'updatedChatIds';

export const ChatsPane: React.FC = () => {
  // ... existing code ...

  const [updatedChatIds, setUpdatedChatIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load updated chat IDs from local storage
    const storedUpdatedChatIds = localStorage.getItem(UPDATED_CHATS_KEY);
    if (storedUpdatedChatIds) {
      setUpdatedChatIds(new Set(JSON.parse(storedUpdatedChatIds)));
    }
  }, []);

  // Effect to clear updatedChatIds after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setUpdatedChatIds(new Set());
      localStorage.removeItem(UPDATED_CHATS_KEY);
    }, 5000); // Clear after 5 seconds

    return () => clearTimeout(timer);
  }, [updatedChatIds]);

  const handleTitleUpdate = (chatId: string) => {
    const newUpdatedChatIds = new Set(updatedChatIds).add(chatId);
    setUpdatedChatIds(newUpdatedChatIds);
    localStorage.setItem(UPDATED_CHATS_KEY, JSON.stringify(Array.from(newUpdatedChatIds)));
  };

  // ... existing code ...

  return (
    // ... existing code ...
    <ChatItem
      // ... other props ...
      isUpdated={updatedChatIds.has(chat._id)}
    >
      {/* ... */}
    </ChatItem>
    // ... existing code ...
  );
};
```

2. In `panes/chats/ChatItem.tsx`:

```typescript
interface ChatItemProps {
  // ... other props ...
  isUpdated: boolean;
}

export function ChatItem({ index, chat, children, isNew, isUpdated }: ChatItemProps) {
  // ... existing code ...

  const shouldAnimate = isNew || isUpdated;

  // ... existing code ...

  return (
    <motion.div
      // ... other props ...
      initial={shouldAnimate ? 'initial' : false}
      animate={shouldAnimate ? 'animate' : false}
    >
      {/* ... existing content ... */}
    </motion.div>
  );
}
```

3. To trigger the animation when a chat title is updated, call the `handleTitleUpdate` function after successfully updating the title:

```typescript
const updateChatTitle = async (chatId: string, newTitle: string) => {
  try {
    // Update the chat title in your backend
    await updateChatTitleInBackend(chatId, newTitle);
    
    // Mark the chat as updated to trigger the animation
    handleTitleUpdate(chatId);
  } catch (error) {
    console.error('Error updating chat title:', error);
  }
};
```

## Deployment

To ensure the `generateTitle` function is available, make sure to deploy the updated Convex functions using:

```
npx convex deploy
```

## Troubleshooting

- If you encounter the error "Could not find public function for 'threads:generateTitle'", it usually means that the Convex functions haven't been deployed after making changes. Always run `npx convex deploy` after modifying Convex functions.
- If the animation doesn't trigger when updating a chat title, ensure that the `handleTitleUpdate` function is being called correctly after the title update.

## Future Improvements

1. Implement error handling and retries for title generation.
2. Add a way to manually trigger title regeneration.
3. Optimize the title generation process for longer conversations.
4. Consider caching generated titles to reduce API calls.
5. Allow customization of the animation duration and style.
6. Implement a more sophisticated system for tracking which chats have been updated, possibly using a timestamp-based approach instead of a simple Set.

Remember to keep this document updated as the implementation evolves.
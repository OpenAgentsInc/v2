# Dynamic Title Generation and Animation

After the first message is received from an assistant, a dynamic title is generated via OpenAI. When a chat's title is updated, an animation is triggered to highlight the change.

## Implementation

The dynamic title generation is implemented using Convex functions, and the animation is handled in the React components.

### Title Generation

1. The `generateTitle` function is defined in `convex/threads/generateTitle.ts`:

```typescript
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
          content: `Please generate a short, concise title (5 words or less) for the following conversation:\n\n${formattedMessages}`,
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
```

2. The `useChat` hook in `hooks/chat/useChatCore.ts` calls this function after the first assistant message:

```typescript
export function useChat({ propsId }: { propsId?: Id<"threads"> }) {
  // ... other code ...

  const vercelChatProps = useVercelChat({
    // ... other props ...
    onFinish: async (message, options) => {
      if (threadId && user) {
        const updatedMessages = [...threadData.messages, message as Message];
        setThreadData({ ...threadData, messages: updatedMessages });

        try {
          const result = await sendMessageMutation({
            thread_id: threadId,
            clerk_user_id: user.id,
            content: message.content,
            role: message.role,
            model_id: currentModelRef.current || model.id,
          });

          if (result && typeof result === 'object' && 'balance' in result) {
            setBalance(result.balance as number);
          }
          setError(null);

          if (updatedMessages.length === 1 && updatedMessages[0].role === 'assistant') {
            try {
              const title = await generateTitle({ threadId });
              setThreadData((prevThreadData) => ({
                ...prevThreadData,
                metadata: { ...prevThreadData.metadata, title },
              }));
              
              // Trigger the title update animation
              await updateThreadData({ threadId, title });
            } catch (error) {
              console.error('Error generating title:', error);
            }
          }
        } catch (error: any) {
          console.error('Error saving chat message:', error);
          setError(error.message || 'An error occurred while saving the message');
        }
      }
    },
    // ... other code ...
  });

  // ... rest of the component ...
}
```

### Title Update Animation

The animation for updated chat titles is implemented in the `ChatItem` component.

1. In `panes/chats/ChatItem.tsx`:

```typescript
interface ChatItemProps {
  index: number;
  chat: Chat;
  children: React.ReactNode;
  isNew: boolean;
  isUpdated: boolean;
}

export function ChatItem({ index, chat, children, isNew, isUpdated }: ChatItemProps) {
  const shouldAnimate = isNew || isUpdated;

  return (
    <motion.div
      className="relative h-8"
      variants={{
        initial: {
          height: 0,
          opacity: 0
        },
        animate: {
          height: 'auto',
          opacity: 1
        }
      }}
      initial={shouldAnimate ? 'initial' : false}
      animate={shouldAnimate ? 'animate' : false}
      transition={{
        duration: 0.25,
        ease: 'easeIn'
      }}
    >
      {/* ... other content ... */}
      <span className="whitespace-nowrap">
        {shouldAnimate ? (
          chat.title.split('').map((character, index) => (
            <motion.span
              key={index}
              variants={{
                initial: {
                  opacity: 0,
                  x: -100
                },
                animate: {
                  opacity: 1,
                  x: 0
                }
              }}
              initial="initial"
              animate="animate"
              transition={{
                duration: 0.25,
                ease: 'easeIn',
                delay: index * 0.05,
                staggerChildren: 0.05
              }}
            >
              {character}
            </motion.span>
          ))
        ) : (
          <span>{chat.title}</span>
        )}
      </span>
      {/* ... other content ... */}
    </motion.div>
  );
}
```

2. In `panes/chats/ChatsPane.tsx`:

```typescript
export const ChatsPane: React.FC = () => {
  // ... other code ...

  const [updatedChatIds, setUpdatedChatIds] = useState<Set<string>>(new Set());

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

  // ... other code ...

  return (
    // ... other JSX ...
    <ChatItem
      key={chat._id}
      index={sortedChats.indexOf(chat)}
      chat={{
        id: chat._id,
        title: chat.metadata?.title || `Chat ${new Date(chat._creationTime).toLocaleString()}`,
        sharePath: chat.shareToken ? `/share/${chat.shareToken}` : undefined,
        messages: [],
        createdAt: new Date(chat._creationTime),
        userId: chat.user_id,
        path: ''
      }}
      isNew={!seenChatIds.has(chat._id)}
      isUpdated={updatedChatIds.has(chat._id)}
    >
      {/* ... chat item content ... */}
    </ChatItem>
    // ... other JSX ...
  );
};
```

## Workflow

1. When a new chat is created, the `generateTitle` function is called after the first assistant message.
2. The generated title is saved to the thread's metadata.
3. The `ChatsPane` component tracks updated chat IDs using the `updatedChatIds` state.
4. When a chat's title is updated, the `handleTitleUpdate` function is called, which adds the chat ID to the `updatedChatIds` set.
5. The `ChatItem` component receives the `isUpdated` prop, which triggers the animation when true.
6. The animation lasts for 5 seconds before the `updatedChatIds` set is cleared.

## Troubleshooting

- If the animation doesn't trigger when updating a chat title, check that:
  1. The `generateTitle` function is being called correctly after the first assistant message.
  2. The `handleTitleUpdate` function is being called when a title is updated.
  3. The `isUpdated` prop is being passed correctly to the `ChatItem` component.
  4. The `updatedChatIds` state in `ChatsPane` is being updated and cleared correctly.

## Future Improvements

1. Implement error handling and retries for title generation.
2. Add a way to manually trigger title regeneration.
3. Optimize the title generation process for longer conversations.
4. Consider caching generated titles to reduce API calls.
5. Allow customization of the animation duration and style.
6. Add unit and integration tests to ensure the title generation and animation features work correctly.

Remember to keep this document updated as the implementation evolves.
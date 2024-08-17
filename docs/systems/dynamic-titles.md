# Dynamic Title Generation and Animation

After the first message is received from an assistant, a dynamic title is generated via OpenAI. When a chat's title is updated, an animation is triggered to highlight the change.

## Implementation

The dynamic title generation is implemented using Convex functions, and the animation is handled in the React components.

### Title Generation

1. The `generateTitle` function is defined in `convex/threads.ts`:

```typescript
export const generateTitle = mutation({
  args: { threadId: v.id("threads") },
  async handler(ctx, args) {
    // ... (implementation details)
  },
});
```

2. The `useChat` hook in `hooks/chat/useChatCore.ts` calls this function after the first assistant message:

```typescript
const vercelChatProps = useVercelChat({
  // ... other props
  onFinish: async (message, options) => {
    if (threadId && user) {
      // ... other logic

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
    }
  },
});
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

3. The animation is triggered in `hooks/chat/useChatCore.ts`:

```typescript
export function useChat({ propsId }: { propsId?: Id<"threads"> }) {
  // ... other code ...

  const updateThreadData = useMutation(api.threads.updateThreadData.updateThreadData);

  const vercelChatProps = useVercelChat({
    // ... other props ...
    onFinish: async (message, options) => {
      // ... other logic ...

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
    },
  });

  // ... rest of the component ...
}
```

## Deployment

To ensure the `generateTitle` and `updateThreadData` functions are available, make sure to deploy the updated Convex functions using:

```
npx convex deploy
```

## Troubleshooting

- If you encounter the error "Could not find public function for 'threads:generateTitle'" or "Could not find public function for 'threads:updateThreadData'", it usually means that the Convex functions haven't been deployed after making changes. Always run `npx convex deploy` after modifying Convex functions.
- If the animation doesn't trigger when updating a chat title, ensure that:
  1. The `updateThreadData` mutation is correctly implemented in your Convex backend.
  2. The `ChatsPane` component is correctly updating the `updatedChatIds` state when it receives updates from the backend.
  3. The `isUpdated` prop is being passed correctly to the `ChatItem` component.

## Future Improvements

1. Implement error handling and retries for title generation.
2. Add a way to manually trigger title regeneration.
3. Optimize the title generation process for longer conversations.
4. Consider caching generated titles to reduce API calls.
5. Allow customization of the animation duration and style.
6. Implement a more sophisticated system for tracking which chats have been updated, possibly using a timestamp-based approach instead of a simple Set.
7. Add unit and integration tests to ensure the title generation and animation features work correctly.

Remember to keep this document updated as the implementation evolves.
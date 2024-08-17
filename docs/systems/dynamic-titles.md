# Dynamic Title Generation and Animation

After the first message is received from an assistant, a dynamic title is generated via OpenAI. When a chat's title is updated, an animation is triggered to highlight the change.

## Simplified Implementation

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
export function useChat({ propsId }: { propsId?: Id<"threads"> }) {
  // ... other code ...

  const generateTitle = useMutation(api.threads.generateTitle);
  const updateThreadData = useMutation(api.threads.updateThreadData);

  const vercelChatProps = useVercelChat({
    // ... other props
    onFinish: async (message, options) => {
      if (threadId && user) {
        // ... other logic

        if (updatedMessages.length === 1 && updatedMessages[0].role === 'assistant') {
          try {
            const title = await generateTitle({ threadId });
            await updateThreadData({ threadId, title });
          } catch (error) {
            console.error('Error generating title:', error);
          }
        }
      }
    },
  });

  // ... rest of the component ...
}
```

### Title Update Animation

The animation for updated chat titles is implemented in the `ChatsPane` and `ChatItem` components.

1. In `panes/chats/ChatsPane.tsx`:

```typescript
export const ChatsPane: React.FC = () => {
  const { chats, updatedChatIds } = useChats();

  return (
    // ... existing code ...
    {chats.map((chat) => (
      <ChatItem
        key={chat._id}
        chat={chat}
        isUpdated={updatedChatIds.has(chat._id)}
      />
    ))}
    // ... existing code ...
  );
};
```

2. In `panes/chats/ChatItem.tsx`:

```typescript
interface ChatItemProps {
  chat: Chat;
  isUpdated: boolean;
}

export function ChatItem({ chat, isUpdated }: ChatItemProps) {
  return (
    <motion.div
      initial={isUpdated ? { backgroundColor: "#4a5568" } : false}
      animate={isUpdated ? { backgroundColor: "#2d3748" } : false}
      transition={{ duration: 1 }}
    >
      {/* ... chat item content ... */}
    </motion.div>
  );
}
```

3. Create a new `useChats` hook in `hooks/useChats.ts`:

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useEffect, useState } from 'react';

export function useChats() {
  const chats = useQuery(api.threads.getUserThreads) || [];
  const [updatedChatIds, setUpdatedChatIds] = useState(new Set<string>());

  const subscribeToThreadUpdates = useMutation(api.threads.subscribeToThreadUpdates);

  useEffect(() => {
    const unsubscribe = subscribeToThreadUpdates((updatedThread) => {
      setUpdatedChatIds((prev) => new Set(prev).add(updatedThread._id));
      
      // Clear the updated status after 5 seconds
      setTimeout(() => {
        setUpdatedChatIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(updatedThread._id);
          return newSet;
        });
      }, 5000);
    });

    return () => {
      unsubscribe();
    };
  }, [subscribeToThreadUpdates]);

  return { chats, updatedChatIds };
}
```

4. Update the Convex function in `convex/threads.ts`:

```typescript
export const subscribeToThreadUpdates = subscription((ctx) => {
  return ctx.db.table("threads").onUpdate((thread) => {
    return thread;
  });
});
```

## Deployment

To ensure the `generateTitle`, `updateThreadData`, and `subscribeToThreadUpdates` functions are available, make sure to deploy the updated Convex functions using:

```
npx convex deploy
```

## Troubleshooting

- If you encounter errors related to missing Convex functions, ensure that you've run `npx convex deploy` after making changes to the Convex functions.
- If the animation doesn't trigger when updating a chat title, check that:
  1. The `updateThreadData` mutation is correctly implemented in your Convex backend.
  2. The `useChats` hook is correctly updating the `updatedChatIds` state when it receives updates from the backend.
  3. The `isUpdated` prop is being passed correctly to the `ChatItem` component.

## Future Improvements

1. Implement error handling and retries for title generation.
2. Add a way to manually trigger title regeneration.
3. Optimize the title generation process for longer conversations.
4. Consider caching generated titles to reduce API calls.
5. Allow customization of the animation duration and style.
6. Add unit and integration tests to ensure the title generation and animation features work correctly.

Remember to keep this document updated as the implementation evolves.
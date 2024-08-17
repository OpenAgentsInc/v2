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
    const thread = await ctx.db.get(args.threadId);
    if (!thread) throw new Error("Thread not found");

    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("threadId"), args.threadId))
      .order("desc")
      .take(5);

    // Use OpenAI to generate a title based on the messages
    const title = await generateTitleWithAI(messages);

    // Update the thread with the new title
    await ctx.db.patch(args.threadId, { title });

    return title;
  },
});
```

2. The `useChat` hook in `hooks/useChat.ts` calls this function after the first assistant message:

```typescript
export function useChat(threadId: Id<"threads">) {
  const generateTitle = useMutation(api.threads.generateTitle);

  const handleNewMessage = useCallback(async (message: Message) => {
    if (message.role === 'assistant') {
      const messagesInThread = await getMessagesForThread(threadId);
      if (messagesInThread.length === 2) { // User message + AI response
        try {
          await generateTitle({ threadId });
        } catch (error) {
          console.error('Error generating title:', error);
        }
      }
    }
  }, [threadId, generateTitle]);

  // ... rest of the hook implementation
}
```

### Title Update Animation

The animation for updated chat titles is implemented in the `ChatItem` component.

1. In `components/ChatItem.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChatItemProps {
  chat: Chat;
  isNew: boolean;
}

export function ChatItem({ chat, isNew }: ChatItemProps) {
  const [isUpdated, setIsUpdated] = useState(isNew);

  useEffect(() => {
    if (isUpdated) {
      const timer = setTimeout(() => setIsUpdated(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isUpdated]);

  return (
    <motion.div
      initial={isUpdated ? { backgroundColor: "#4a5568" } : false}
      animate={isUpdated ? { backgroundColor: "#2d3748" } : false}
      transition={{ duration: 1 }}
    >
      <h3>{chat.title}</h3>
      {/* ... other chat item content ... */}
    </motion.div>
  );
}
```

2. In `components/ChatList.tsx`:

```typescript
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { ChatItem } from './ChatItem';

export function ChatList() {
  const chats = useQuery(api.threads.getUserThreads) || [];

  return (
    <div>
      {chats.map((chat) => (
        <ChatItem key={chat._id} chat={chat} isNew={chat.isNew} />
      ))}
    </div>
  );
}
```

## Deployment

To ensure the `generateTitle` function is available, make sure to deploy the updated Convex functions using:

```
npx convex deploy
```

## Troubleshooting

- If you encounter errors related to missing Convex functions, ensure that you've run `npx convex deploy` after making changes to the Convex functions.
- If the animation doesn't trigger when updating a chat title, check that:
  1. The `generateTitle` mutation is correctly implemented in your Convex backend.
  2. The `isNew` prop is being passed correctly to the `ChatItem` component.
  3. The `useEffect` hook in `ChatItem` is working as expected.

## Future Improvements

1. Implement error handling and retries for title generation.
2. Add a way to manually trigger title regeneration.
3. Optimize the title generation process for longer conversations.
4. Consider caching generated titles to reduce API calls.
5. Allow customization of the animation duration and style.
6. Add unit and integration tests to ensure the title generation and animation features work correctly.

Remember to keep this document updated as the implementation evolves.
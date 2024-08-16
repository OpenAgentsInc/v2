import React from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { usePaneStore } from '@/store/pane';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';

export const NewChatButton: React.FC = () => {
  const createThread = useMutation(api.threads.createNewThread);
  const { openChatPane } = usePaneStore();
  const [isCreating, setIsCreating] = React.useState(false);
  const { user } = useUser();
  if (!user) {
    return null;
  }

  const handleNewChat = async () => {
    setIsCreating(true);
    try {
      const threadId = await createThread({ clerk_user_id: user.id });
      console.log("Skipping open chat pane - don't have the right props")
      // openChatPane(threadId);
    } catch (error) {
      console.error('Error creating new chat:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={handleNewChat}
      disabled={isCreating}
      className="w-full mb-4"
    >
      {isCreating ? 'Creating...' : 'New Chat'}
    </Button>
  );
};

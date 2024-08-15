import React from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { usePaneStore } from '../../store/hud';
import { Button } from '../../components/ui/button';

export const NewChatButton: React.FC = () => {
  const createUser = useMutation(api.users.create);
  const createThread = useMutation(api.threads.create);
  const { openChatPane } = usePaneStore();
  const [isCreating, setIsCreating] = React.useState(false);

  const handleNewChat = async () => {
    setIsCreating(true);
    try {
      const userId = await createUser();
      const threadId = await createThread({ userId });
      openChatPane(threadId);
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

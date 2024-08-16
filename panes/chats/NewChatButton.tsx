import { useMutation } from "convex/react"
import React from "react"
import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { usePaneStore } from "@/store/pane"
import { useUser } from "@clerk/nextjs"

export const NewChatButton: React.FC = () => {
  const createThread = useMutation(api.threads.createNewThread.createNewThread);
  const { openChatPane } = usePaneStore();
  const [isCreating, setIsCreating] = React.useState(false);
  const { user } = useUser();
  if (!user) {
    return null;
  }

  const handleNewChat = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsCreating(true);
    try {
      const threadId = await createThread({ clerk_user_id: user.id });
      const isCommandKeyHeld = event.metaKey || event.ctrlKey; // metaKey for Mac, ctrlKey for Windows/Linux
      openChatPane({ id: threadId, title: 'New Chat', type: 'chat' }, isCommandKeyHeld);
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

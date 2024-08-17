import { useMutation } from "convex/react"
import React from "react"
import { buttonVariants } from "@/components/ui/button"
import { IconPlus } from "@/components/ui/icons"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"
import { usePaneStore } from "@/store/pane"
import { useUser } from "@clerk/nextjs"

interface NewChatButtonProps {
  userId: string;
  onNewChat: (threadId: string, isCommandKeyHeld: boolean) => void;
}

export const NewChatButton: React.FC<NewChatButtonProps> = ({ userId, onNewChat }) => {
  const [isCreating, setIsCreating] = React.useState(false);
  const createNewThread = useMutation(api.threads.createNewThread.createNewThread);

  const handleNewChat = async (event: React.MouseEvent) => {
    setIsCreating(true);
    try {
      const threadId = await createNewThread({ metadata: {}, clerk_user_id: userId });
      onNewChat(threadId, event.metaKey || event.ctrlKey);
    } catch (error) {
      console.error('Error creating new chat:', error);
      // Handle error
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <button
      onClick={handleNewChat}
      disabled={isCreating}
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'h-10 w-full justify-start bg-zinc-50 px-4 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10'
      )}
    >
      <IconPlus className="-translate-x-2 stroke-2" />
      {isCreating ? 'Creating...' : 'New Chat'}
    </button>
  );
};
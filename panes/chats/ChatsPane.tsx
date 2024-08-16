'use client'

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { usePaneStore } from '@/store/pane';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '../../components/ui/alert-dialog';
import { useChatActions } from './useChatActions';
import { ChatItem } from './ChatItem';
import { useUser } from '@clerk/nextjs';
import { buttonVariants } from '@/components/ui/button';
import { IconPlus } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

const SEEN_CHATS_KEY = 'seenChatIds';

interface NewChatButtonProps {
  userId: string;
}

function NewChatButton({ userId }: NewChatButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const createNewThread = useMutation(api.threads.createNewThread.createNewThread);

  const handleNewChat = async (event: React.MouseEvent) => {
    setIsCreating(true);
    try {
      await createNewThread({ metadata: {}, clerk_user_id: userId });
      // Handle successful creation
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
}

export const ChatsPane: React.FC = () => {
  const { user } = useUser();
  const chats = useQuery(api.threads.getUserThreads.getUserThreads, { clerk_user_id: user?.id ?? "skip" });
  const deleteChat = useMutation(api.threads.deleteThread.deleteThread);
  const { panes } = usePaneStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const { handleShare, handleDelete, isDeleting, isSharing } = useChatActions();
  const [seenChatIds, setSeenChatIds] = useState<Set<string>>(new Set());

  const sortedChats = useMemo(() => {
    if (!chats) return [];
    return [...chats]
      .sort((a, b) => new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime())
      .slice(0, 25);
  }, [chats]);

  useEffect(() => {
    // Load seen chat IDs from local storage
    const storedSeenChatIds = localStorage.getItem(SEEN_CHATS_KEY);
    if (storedSeenChatIds) {
      setSeenChatIds(new Set(JSON.parse(storedSeenChatIds)));
    }
  }, []);

  useEffect(() => {
    if (sortedChats.length > 0) {
      const newSeenChatIds = new Set(seenChatIds);
      let hasNewChats = false;

      sortedChats.forEach(chat => {
        if (!newSeenChatIds.has(chat._id)) {
          newSeenChatIds.add(chat._id);
          hasNewChats = true;
        }
      });

      if (hasNewChats) {
        setSeenChatIds(newSeenChatIds);
        localStorage.setItem(SEEN_CHATS_KEY, JSON.stringify(Array.from(newSeenChatIds)));
      }
    }
  }, [sortedChats, seenChatIds]);

  const confirmDelete = async () => {
    if (chatToDelete) {
      await handleDelete(chatToDelete);
      setDeleteDialogOpen(false);
      setChatToDelete(null);
    }
  };

  const activeChatId = panes.find(pane => pane.type === 'chat' && pane.isActive)?.id;

  const isLoading = chats === undefined;

  return (
    <div className="flex flex-col h-full">
      <div className="mt-2 mb-2 px-2">
        {user && <NewChatButton userId={user.id} />}
      </div>
      {isLoading ? (
        <div className="flex flex-col flex-1 px-4 space-y-4 overflow-auto">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-6 rounded-md shrink-0 animate-pulse bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto">
          {sortedChats.map((chat) => (
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
            >
              <div className="flex space-x-2">
                <button onClick={() => handleShare(chat._id)} disabled={isSharing}>
                  Share
                </button>
                <button onClick={() => {
                  setChatToDelete(chat._id);
                  setDeleteDialogOpen(true);
                }} disabled={isDeleting}>
                  Delete
                </button>
              </div>
            </ChatItem>
          ))}
        </div>
      )}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the chat and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
'use client'

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { usePaneStore } from '@/store/pane';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '../../components/ui/alert-dialog';
import { useChatActions } from './useChatActions';
import { ChatItem } from './ChatItem';
import { NewChatButton } from './NewChatButton';
import { useUser } from '@clerk/nextjs';

export const ChatsPane: React.FC = () => {
  const { user } = useUser();
  const chats = useQuery(api.threads.getUserThreads.getUserThreads, { clerk_user_id: user?.id ?? "skip" });
  const deleteChat = useMutation(api.threads.deleteThread.deleteThread);
  const { panes } = usePaneStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const { handleShare, handleDelete, isDeleting, isSharing } = useChatActions();

  const sortedChats = useMemo(() => {
    if (!chats) return [];
    return [...chats]
      .sort((a, b) => new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime())
      .slice(0, 25);
  }, [chats]);

  const confirmDelete = async () => {
    if (chatToDelete) {
      await handleDelete(chatToDelete);
      setDeleteDialogOpen(false);
      setChatToDelete(null);
    }
  };

  const activeChatId = panes.find(pane => pane.type === 'chat' && pane.isActive)?.id;

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      <NewChatButton />
      <div className="flex-grow overflow-y-auto">
        {sortedChats.map((chat, index) => (
          <ChatItem
            key={chat._id}
            index={index}
            chat={{
              id: chat._id,
              title: chat.metadata?.title || `Chat ${new Date(chat._creationTime).toLocaleString()}`,
              sharePath: chat.shareToken ? `/share/${chat.shareToken}` : undefined,
              messages: [],
              createdAt: new Date(chat._creationTime),
              userId: chat.user_id,
              path: '' // Removed chat.path as it doesn't exist
            }}
            isNew={index === 0}
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
      <footer className="p-4 flex justify-center">
        {/* Add footer content here */}
      </footer>
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

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
  const chats = useQuery(api.threads.getUserThreads, { clerk_user_id: user?.id ?? "skip" });
  const deleteChat = useMutation(api.threads.deleteThread);
  const { panes, openChatPane } = usePaneStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const { handleShare, handleDelete, isDeleting, isSharing } = useChatActions();

  const sortedChats = useMemo(() => {
    if (!chats) return [];
    return [...chats]
      .sort((a, b) => new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime())
      .slice(0, 25);
  }, [chats]);

  const handleChatAction = (chatId: string, action: 'open' | 'delete' | 'share') => {
    switch (action) {
      case 'open':
        openChatPane({ type: 'chat', id: chatId, title: `Chat ${chatId}` });
        break;
      case 'delete':
        setChatToDelete(chatId);
        setDeleteDialogOpen(true);
        break;
      case 'share':
        handleShare(chatId);
        break;
    }
  };

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
        {sortedChats.map((chat) => (
          <ChatItem
            key={chat._id}
            chat={chat}
            onAction={handleChatAction}
            isDeleting={isDeleting}
            isSharing={isSharing}
            isActive={chat._id === activeChatId}
          />
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
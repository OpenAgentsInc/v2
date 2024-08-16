import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export const useChatActions = () => {
  const deleteChat = useMutation(api.messages.deleteThread);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleDelete = async (chatId: string) => {
    setIsDeleting(true);
    try {
      await deleteChat({ thread_id: chatId as Id<'threads'> });
    } catch (error) {
      console.error('Error deleting chat:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async (chatId: string) => {
    setIsSharing(true);
    try {
      const shareUrl = `${window.location.origin}/chat/${chatId}`;
      await navigator.clipboard.writeText(shareUrl);
      // You can add a toast notification here to inform the user that the link has been copied
    } catch (error) {
      console.error('Error sharing chat:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return {
    handleDelete,
    handleShare,
    isDeleting,
    isSharing,
  };
};
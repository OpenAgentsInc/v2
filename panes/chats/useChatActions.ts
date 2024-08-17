import { useMutation } from "convex/react"
import { useState } from "react"
import { toast } from "sonner"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { ServerActionResult, Chat } from "@/lib/types"

export const useChatActions = () => {
  const deleteChat = useMutation(api.threads.deleteThread.deleteThread);
  const shareChat = useMutation(api.threads.shareThread.shareThread);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleDelete = async (chatId: string) => {
    setIsDeleting(true);
    try {
      await deleteChat({ thread_id: chatId as Id<'threads'> });
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async (chatId: string): Promise<boolean> => {
    setIsSharing(true);
    try {
      const result = await shareChat({ thread_id: chatId as Id<'threads'> });
      if (!result) {
        toast.error('Failed to share chat');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error sharing chat:', error);
      toast.error('Failed to share chat');
      return false;
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyShareLink = async (chatId: string) => {
    const isShared = await handleShare(chatId);
    if (!isShared) {
      return;
    }
    const shareUrl = `${window.location.origin}/share/${chatId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Chat link copied to clipboard');
    } catch (error) {
      console.error('Error copying share link:', error);
      toast.error('Failed to copy share link');
    }
  };

  const handleShareTwitter = async (chatId: string) => {
    const isShared = await handleShare(chatId);
    if (!isShared) {
      return;
    }
    const shareUrl = `${window.location.origin}/share/${chatId}`;
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=Check out this chat on OpenAgents!&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterShareUrl, '_blank');
  };

  return {
    handleDelete,
    handleShare,
    handleCopyShareLink,
    handleShareTwitter,
    isDeleting,
    isSharing,
  };
};
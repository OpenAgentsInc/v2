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

  const handleShare = (chatId: string): string => {
    setIsSharing(true);
    try {
      const result = shareChat({ thread_id: chatId as Id<'threads'> });
      if (result && 'error' in result) {
        toast.error(result.error);
        return '';
      }
      const shareUrl = `${window.location.origin}/share/${result.shareToken}`;
      return shareUrl;
    } catch (error) {
      console.error('Error sharing chat:', error);
      toast.error('Failed to share chat');
      return '';
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyShareLink = (chatId: string) => {
    const shareUrl = handleShare(chatId);
    if (!shareUrl) {
      toast.error('Could not generate share link');
      return;
    }
    try {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Chat link copied to clipboard');
    } catch (error) {
      console.error('Error copying share link:', error);
      toast.error('Failed to copy share link');
    }
  };

  const handleShareTwitter = (chatId: string) => {
    const shareUrl = handleShare(chatId);
    if (!shareUrl) {
      toast.error('Could not generate share link');
      return;
    }
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
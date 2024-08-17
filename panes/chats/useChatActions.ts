import { useMutation } from "convex/react"
import { useState } from "react"
import { toast } from "sonner"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

export const useChatActions = () => {
  const deleteChat = useMutation(api.threads.deleteThread.deleteThread);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const getShareUrl = (chatId: string) => {
    return `${window.location.origin}/share/${chatId}`;
  };

  const handleShare = (chatId: string) => {
    return getShareUrl(chatId);
  };

  const handleCopyShareLink = async (chatId: string) => {
    try {
      const shareUrl = getShareUrl(chatId);
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Chat link copied to clipboard');
    } catch (error) {
      console.error('Error copying share link:', error);
      toast.error('Failed to copy share link');
    }
  };

  const handleShareTwitter = (chatId: string) => {
    const shareUrl = getShareUrl(chatId);
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=Check out this chat on OpenAgents!&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterShareUrl, '_blank');
  };

  return {
    handleDelete,
    handleShare,
    handleCopyShareLink,
    handleShareTwitter,
    isDeleting,
  };
};
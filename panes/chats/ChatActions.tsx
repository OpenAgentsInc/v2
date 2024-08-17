import React from 'react';
import { useChatActions } from './useChatActions';

interface ChatActionsProps {
  chatId: string;
}

export const ChatActions: React.FC<ChatActionsProps> = ({ chatId }) => {
  const { handleShare, handleDelete, isDeleting, isSharing } = useChatActions();

  return (
    <div className="flex space-x-2">
      <button onClick={() => handleShare(chatId)} disabled={isSharing}>
        Share
      </button>
      <button onClick={() => handleDelete(chatId)} disabled={isDeleting}>
        Delete
      </button>
    </div>
  );
};
import React from 'react';
import { motion } from 'framer-motion';
import { IconMessage, IconUsers, IconShare, IconTrash } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatItemProps {
  chat: {
    _id: string;
    _creationTime: number;
    metadata?: {
      title?: string;
    };
    shareToken?: string;
    clerk_user_id: string;
    createdAt: string;
    user_id: string;
  };
  onAction: (chatId: string, action: 'open' | 'delete' | 'share') => void;
  isDeleting: boolean;
  isSharing: boolean;
  isActive: boolean;
}

export const ChatItem: React.FC<ChatItemProps> = ({ chat, onAction, isDeleting, isSharing, isActive }) => {
  const title = chat.metadata?.title || `Chat ${new Date(chat._creationTime).toLocaleString()}`;

  return (
    <motion.div
      className={cn(
        'group relative flex items-center px-2 py-2 my-1 rounded-md cursor-pointer transition-colors duration-200',
        isActive
          ? 'bg-gray-800 text-white'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      )}
      onClick={() => onAction(chat._id, 'open')}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex-grow flex items-center overflow-hidden">
        {chat.shareToken ? (
          <IconUsers className="flex-shrink-0 h-5 w-5 mr-2" />
        ) : (
          <IconMessage className="flex-shrink-0 h-5 w-5 mr-2" />
        )}
        <span className="truncate">{title}</span>
      </div>
      <div className="flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onAction(chat._id, 'share');
          }}
          disabled={isSharing}
        >
          <IconShare className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onAction(chat._id, 'delete');
          }}
          disabled={isDeleting}
        >
          <IconTrash className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};
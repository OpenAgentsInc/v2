import React from 'react';
import { motion } from 'framer-motion';
import { IconMessage, IconUsers, IconShare, IconTrash } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';

interface ChatItemProps {
  chat: {
    _id: string;
    title: string;
    sharePath?: string;
  };
  onAction: (chatId: string, action: 'open' | 'delete' | 'share') => void;
  isDeleting: boolean;
  isSharing: boolean;
}

export const ChatItem: React.FC<ChatItemProps> = ({ chat, onAction, isDeleting, isSharing }) => {
  return (
    <motion.div
      className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
      whileHover={{ scale: 1.02 }}
      onClick={() => onAction(chat._id, 'open')}
    >
      <div className="flex items-center">
        {chat.sharePath ? <IconUsers className="mr-2" /> : <IconMessage className="mr-2" />}
        <span>{chat.title}</span>
      </div>
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAction(chat._id, 'share');
          }}
          disabled={isSharing}
        >
          <IconShare />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAction(chat._id, 'delete');
          }}
          disabled={isDeleting}
        >
          <IconTrash />
        </Button>
      </div>
    </motion.div>
  );
};

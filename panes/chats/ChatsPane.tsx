'use client'

import { useMutation, useQuery } from "convex/react"
import React, { useEffect, useMemo, useState } from "react"
import { api } from "@/convex/_generated/api"
import { useChat } from "@/hooks/useChat"
import { usePaneStore } from "@/store/pane"
import { useUser } from "@clerk/nextjs"
import { ChatActions } from "./ChatActions"
import { ChatItem } from "./ChatItem"
import { NewChatButton } from "./NewChatButton"
import { AnimatePresence, motion } from "framer-motion"
import { Id } from "@/convex/_generated/dataModel"

const SEEN_CHATS_KEY = 'seenChatIds';

export const ChatsPane: React.FC = () => {
  const { user } = useUser();
  const chats = useQuery(api.threads.getUserThreads.getUserThreads, { clerk_user_id: user?.id ?? "skip" });
  const { panes, openChatPane } = usePaneStore();
  const [seenChatIds, setSeenChatIds] = useState<Set<string>>(new Set());
  const [deletedChatIds, setDeletedChatIds] = useState<Set<string>>(new Set());

  const deleteThread = useMutation(api.threads.deleteThread.deleteThread);

  const sortedChats = useMemo(() => {
    if (!chats) return [];
    return [...chats]
      .sort((a, b) => new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime())
      .slice(0, 25);
  }, [chats]);

  // Fetch message counts for all chats
  const messageCounts = useQuery(api.threads.getThreadMessageCount.getThreadMessageCount, 
    { thread_ids: sortedChats.map(chat => chat._id) }
  ) as { [key: Id<"threads">]: number } | undefined;

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

  const handleNewChat = (threadId: string, isCommandKeyHeld: boolean) => {
    openChatPane({
      id: threadId,
      title: 'New Chat',
      type: 'chat',
    }, isCommandKeyHeld);
  };

  const removeChat = async ({ id }: { id: string }) => {
    try {
      await deleteThread({ thread_id: id });
      setDeletedChatIds(prev => new Set(prev).add(id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting thread:', error);
      return { success: false, error: 'Failed to delete chat' };
    }
  };

  const activeChatId = panes.find(pane => pane.type === 'chat' && pane.isActive)?.id;

  // Use the useChat hook without the onTitleUpdate callback
  useChat({ propsId: activeChatId });

  const isLoading = chats === undefined;

  return (
    <div className="flex flex-col h-full">
      <div className="mt-2 mb-2 px-2">
        {user && <NewChatButton userId={user.id} onNewChat={handleNewChat} />}
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
          <AnimatePresence>
            {sortedChats.map((chat) => 
              !deletedChatIds.has(chat._id) && (
                <motion.div
                  key={chat._id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChatItem
                    index={sortedChats.indexOf(chat)}
                    chat={{
                      id: chat._id,
                      title: chat.metadata?.title || `Chat ${new Date(chat._creationTime).toLocaleString()}`,
                      messages: [],
                      createdAt: new Date(chat._creationTime),
                      userId: chat.user_id,
                      path: ''
                    }}
                    isNew={!seenChatIds.has(chat._id)}
                    isUpdated={false}
                  >
                    <ChatActions
                      chatId={chat._id}
                      title={chat.metadata?.title || `Chat ${new Date(chat._creationTime).toLocaleString()}`}
                      messageCount={messageCounts?.[chat._id] ?? 0}
                      removeChat={removeChat}
                    />
                  </ChatItem>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
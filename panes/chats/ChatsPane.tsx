'use client'

import { useQuery, useMutation } from "convex/react"
import React, { useEffect, useMemo, useState } from "react"
import { api } from "@/convex/_generated/api"
import { useChat } from "@/hooks/useChat"
import { usePaneStore } from "@/store/pane"
import { useUser } from "@clerk/nextjs"
import { ChatActions } from "./ChatActions"
import { ChatItem } from "./ChatItem"
import { NewChatButton } from "./NewChatButton"

const SEEN_CHATS_KEY = 'seenChatIds';
const UPDATED_CHATS_KEY = 'updatedChatIds';

export const ChatsPane: React.FC = () => {
  const { user } = useUser();
  const chats = useQuery(api.threads.getUserThreads.getUserThreads, { clerk_user_id: user?.id ?? "skip" });
  const { panes, openChatPane } = usePaneStore();
  const [seenChatIds, setSeenChatIds] = useState<Set<string>>(new Set());
  const [updatedChatIds, setUpdatedChatIds] = useState<Set<string>>(new Set());
  const [forceUpdate, setForceUpdate] = useState(0);

  const deleteThread = useMutation(api.threads.deleteThread.deleteThread);

  const sortedChats = useMemo(() => {
    if (!chats) return [];
    return [...chats]
      .sort((a, b) => new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime())
      .slice(0, 25);
  }, [chats]);

  useEffect(() => {
    // Load seen chat IDs from local storage
    const storedSeenChatIds = localStorage.getItem(SEEN_CHATS_KEY);
    if (storedSeenChatIds) {
      setSeenChatIds(new Set(JSON.parse(storedSeenChatIds)));
    }

    // Load updated chat IDs from local storage
    const storedUpdatedChatIds = localStorage.getItem(UPDATED_CHATS_KEY);
    if (storedUpdatedChatIds) {
      setUpdatedChatIds(new Set(JSON.parse(storedUpdatedChatIds)));
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

  // Effect to clear updatedChatIds after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setUpdatedChatIds(new Set());
      localStorage.removeItem(UPDATED_CHATS_KEY);
      setForceUpdate(prev => prev + 1); // Force re-render
    }, 5000); // Clear after 5 seconds

    return () => clearTimeout(timer);
  }, [updatedChatIds]);

  const handleNewChat = (threadId: string, isCommandKeyHeld: boolean) => {
    openChatPane({
      id: threadId,
      title: 'New Chat',
      type: 'chat',
    }, isCommandKeyHeld);
  };

  const handleTitleUpdate = (chatId: string) => {
    const newUpdatedChatIds = new Set(updatedChatIds).add(chatId);
    setUpdatedChatIds(newUpdatedChatIds);
    localStorage.setItem(UPDATED_CHATS_KEY, JSON.stringify(Array.from(newUpdatedChatIds)));
    setForceUpdate(prev => prev + 1); // Force re-render
  };

  const removeChat = async ({ id }: { id: string }) => {
    try {
      await deleteThread({ thread_id: id });
      return { success: true };
    } catch (error) {
      console.error('Error deleting thread:', error);
      return { success: false, error: 'Failed to delete chat' };
    }
  };

  const activeChatId = panes.find(pane => pane.type === 'chat' && pane.isActive)?.id;

  // Use the useChat hook with the onTitleUpdate callback
  useChat({ propsId: activeChatId, onTitleUpdate: handleTitleUpdate });

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
          {sortedChats.map((chat) => (
            <ChatItem
              key={`${chat._id}-${forceUpdate}`}
              index={sortedChats.indexOf(chat)}
              chat={{
                id: chat._id,
                title: chat.metadata?.title || `Chat ${new Date(chat._creationTime).toLocaleString()}`,
                sharePath: chat.shareToken ? `/share/${chat.shareToken}` : undefined,
                messages: [],
                createdAt: new Date(chat._creationTime),
                userId: chat.user_id,
                path: ''
              }}
              isNew={!seenChatIds.has(chat._id)}
              isUpdated={updatedChatIds.has(chat._id)}
            >
              <ChatActions chatId={chat._id} removeChat={removeChat} />
            </ChatItem>
          ))}
        </div>
      )}
    </div>
  );
};
import { useState, useEffect } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Chat as Thread, Message } from "@/types";
import { useChatStore } from "../../store/chat";
import { useUser } from "@clerk/nextjs";

export function useChatThread(propsId?: Id<"threads">) {
  const { user } = useUser();
  const [threadId, setThreadId] = useState<Id<"threads"> | null>(propsId || null);
  const [threadData, setThreadData] = useState<Thread>({
    id: '' as Id<"threads">,
    title: '',
    messages: [],
    createdAt: new Date(),
    userId: '' as Id<"users">,
    path: ''
  });

  const { setThread } = useChatStore();
  const generateTitle = useAction(api.threads.generateTitle.generateTitle);
  const updateThreadData = useMutation(api.threads.updateThreadData.updateThreadData);

  const updateTitle = async (newThreadId: Id<"threads">) => {
    try {
      const title = await generateTitle({ threadId: newThreadId });
      setThreadData((prevThreadData) => ({
        ...prevThreadData,
        metadata: { ...prevThreadData.metadata, title },
      }));

      await updateThreadData({
        thread_id: newThreadId,
        metadata: { title }
      });
    } catch (error) {
      console.error('Error generating title:', error);
    }
  };

  useEffect(() => {
    if (threadId && user) {
      const thread: Thread = {
        id: threadId,
        title: 'New Chat',
        messages: [],
        createdAt: new Date(),
        userId: user.id as Id<"users">,
        path: ''
      };
      setThreadData(thread);
      setThread(threadId, thread);
    }
  }, [threadId, user, setThread]);

  return {
    threadId,
    setThreadId,
    threadData,
    setThreadData,
    updateTitle
  };
}
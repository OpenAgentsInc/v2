import { useMutation, useQuery } from "convex/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Message } from "@/types"
import { useUser } from "@clerk/nextjs"
import { api } from "../convex/_generated/api"
import { Id } from "../convex/_generated/dataModel"
import { useChatStore } from "./useChatStore"

export function useThreadManagement(propsId?: string) {
  console.log('useThreadManagement');
  return
  const { currentThreadId, setCurrentThreadId, setMessages } = useChatStore();
  const [threadId, setThreadId] = useState<Id<"threads"> | null>(null);
  const { user } = useUser();

  const createNewThread = useMutation(api.threads.createNewThread.createNewThread);
  const fetchThreadMessages = useQuery(api.messages.fetchThreadMessages.fetchThreadMessages, threadId ? { thread_id: threadId } : "skip");

  useEffect(() => {
    if (propsId) {
      const cleanId = propsId.replace(/^chat-/, '') as Id<"threads">;
      setThreadId(cleanId);
      setCurrentThreadId(cleanId);
    } else if (currentThreadId) {
      const cleanId = (typeof currentThreadId === 'string' ? currentThreadId.replace(/^chat-/, '') : currentThreadId) as Id<"threads">;
      setThreadId(cleanId);
    } else if (!threadId && user) {
      createNewThread({
        clerk_user_id: user.id,
        metadata: {} // You can add any additional metadata here if needed
      })
        .then((newThreadId: Id<"threads">) => {
          setThreadId(newThreadId);
          setCurrentThreadId(newThreadId);
        })
        .catch(error => {
          console.error('Error creating new thread:', error);
          toast.error('Failed to create a new chat thread. Please try again.');
        });
    }
  }, [propsId, threadId, currentThreadId, setCurrentThreadId, createNewThread, user]);

  useEffect(() => {
    if (threadId && fetchThreadMessages) {
      const formattedMessages: Message[] = fetchThreadMessages.map((msg: any) => ({
        _id: msg._id,
        content: msg.content,
        role: msg.role,
        _creationTime: msg._creationTime,
        thread_id: msg.thread_id,
        clerk_user_id: msg.clerk_user_id,
        tool_invocations: msg.tool_invocations,
        finish_reason: msg.finish_reason,
        total_tokens: msg.total_tokens,
        prompt_tokens: msg.prompt_tokens,
        completion_tokens: msg.completion_tokens,
        model_id: msg.model_id,
        cost_in_cents: msg.cost_in_cents
      }));
      setMessages(threadId, formattedMessages);
    }
  }, [threadId, fetchThreadMessages, setMessages]);

  return { threadId, setThreadId };
}

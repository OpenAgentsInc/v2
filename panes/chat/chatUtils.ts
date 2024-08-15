import { Id } from '@/convex/_generated/dataModel';
import { Message } from '@/types';

export interface Thread {
  id: Id<'threads'>;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export interface ChatStore {
  threads: Record<string, Thread>;
  currentThreadId: Id<'threads'> | null;
  setThread: (threadId: Id<'threads'>, thread: Thread) => void;
  setCurrentThreadId: (threadId: Id<'threads'> | null) => void;
  updateThreadTitle: (threadId: Id<'threads'>, title: string) => void;
  addMessageToThread: (threadId: Id<'threads'>, message: Message) => void;
}

export const createNewMessage = (
  threadId: Id<'threads'>,
  userId: string,
  content: string
): Message => ({
  _id: Date.now().toString() as Id<'messages'>,
  thread_id: threadId,
  clerk_user_id: userId,
  role: 'user',
  content,
  _creationTime: Date.now(),
});

export const updateMessageId = (message: Message, newId: Id<'messages'>): Message => ({
  ...message,
  _id: newId,
});
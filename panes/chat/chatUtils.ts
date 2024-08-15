import { Id } from '@/convex/_generated/dataModel';
import { Message } from '@/types';

/**
 * Represents a chat thread.
 */
export interface Thread {
  id: Id<'threads'>;
  title: string;
  messages: Message[];
  createdAt: Date;
}

/**
 * Defines the structure and methods for the chat store.
 */
export interface ChatStore {
  threads: Record<string, Thread>;
  currentThreadId: Id<'threads'> | null;
  setThread: (threadId: Id<'threads'>, thread: Thread) => void;
  setCurrentThreadId: (threadId: Id<'threads'> | null) => void;
  updateThreadTitle: (threadId: Id<'threads'>, title: string) => void;
  addMessageToThread: (threadId: Id<'threads'>, message: Message) => void;
}

/**
 * Creates a new message object.
 * @param threadId - The ID of the thread the message belongs to.
 * @param userId - The ID of the user sending the message.
 * @param content - The content of the message.
 * @returns A new Message object.
 */
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

/**
 * Updates the ID of a message.
 * @param message - The original message object.
 * @param newId - The new ID to assign to the message.
 * @returns A new Message object with the updated ID.
 */
export const updateMessageId = (message: Message, newId: Id<'messages'>): Message => ({
  ...message,
  _id: newId,
});
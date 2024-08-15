import { create } from 'zustand';
import { Message } from '@/types';
import { Id } from '@/convex/_generated/dataModel';

interface Thread {
  id: Id<'threads'>;
  title: string;
  messages: Message[];
  createdAt: Date;
}

interface ChatStore {
  threads: Record<string, Thread>;
  currentThreadId: Id<'threads'> | null;
  setThread: (threadId: Id<'threads'>, thread: Thread) => void;
  setCurrentThreadId: (threadId: Id<'threads'> | null) => void;
  updateThreadTitle: (threadId: Id<'threads'>, title: string) => void;
  addMessageToThread: (threadId: Id<'threads'>, message: Message) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  threads: {},
  currentThreadId: null,
  setThread: (threadId, thread) =>
    set((state) => ({
      threads: { ...state.threads, [threadId]: thread },
    })),
  setCurrentThreadId: (threadId) => set({ currentThreadId: threadId }),
  updateThreadTitle: (threadId, title) =>
    set((state) => ({
      threads: {
        ...state.threads,
        [threadId]: { ...state.threads[threadId], title },
      },
    })),
  addMessageToThread: (threadId, message) =>
    set((state) => ({
      threads: {
        ...state.threads,
        [threadId]: {
          ...state.threads[threadId],
          messages: [...state.threads[threadId].messages, message],
        },
      },
    })),
}));
import { create } from 'zustand';
import { Message } from '@/types';

interface Thread {
  id: number;
  title: string;
  messages: Message[];
}

interface ChatStore {
  threads: Record<number, Thread>;
  currentThreadId: number | null;
  setThread: (threadId: number, thread: Thread) => void;
  setCurrentThreadId: (threadId: number | null) => void;
  updateThreadTitle: (threadId: number, title: string) => void;
  addMessageToThread: (threadId: number, message: Message) => void;
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
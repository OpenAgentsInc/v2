import { create } from 'zustand';
import { ChatStore, Thread } from '@/panes/chat/chatUtils';

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
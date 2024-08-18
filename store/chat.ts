import { create } from 'zustand';
import { ChatStore, Thread } from '@/panes/chat/chatUtils';

/**
 * Creates a Zustand store for managing chat state.
 * This store handles thread management, including adding, updating, and retrieving threads and messages.
 */
export const useChatStore = create<ChatStore>((set) => ({
  threads: {},
  currentThreadId: null,

  /**
   * Sets a thread in the store.
   * @param threadId - The ID of the thread to set.
   * @param thread - The thread object to store.
   */
  setThread: (threadId, thread) =>
    set((state) => ({
      threads: { ...state.threads, [threadId]: thread },
    })),

  /**
   * Sets the current active thread ID.
   * @param threadId - The ID of the thread to set as current.
   */
  setCurrentThreadId: (threadId) => set({ currentThreadId: threadId }),

  /**
   * Updates the title of a specific thread.
   * @param threadId - The ID of the thread to update.
   * @param title - The new title for the thread.
   */
  updateThreadTitle: (threadId, title) =>
    set((state) => ({
      threads: {
        ...state.threads,
        [threadId]: { ...state.threads[threadId], title },
      },
    })),

  /**
   * Adds a message to a specific thread.
   * @param threadId - The ID of the thread to add the message to.
   * @param message - The message object to add.
   */
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
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Message, User } from '@/lib/types'

interface ThreadData {
    messages: Message[];
    input: string;
    hasMore: boolean;
    currentPage: number;
}

interface ChatState {
    threads: Record<string, ThreadData>;
    currentThreadId: string | undefined;
    user: User | undefined;
    addMessage: (threadId: string, message: Message) => void;
    setMessages: (threadId: string, messages: Message[], hasMore: boolean, append?: boolean) => void;
    setInput: (threadId: string, input: string) => void;
    setCurrentThreadId: (id: string | undefined) => void;
    setUser: (user: User | undefined) => void;
    getThreadData: (threadId: string) => ThreadData;
    incrementPage: (threadId: string) => void;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            threads: {},
            currentThreadId: undefined,
            user: undefined,

            addMessage: (threadId, message) => set((state) => ({
                threads: {
                    ...state.threads,
                    [threadId]: {
                        ...state.threads[threadId],
                        messages: [...(state.threads[threadId]?.messages || []), message],
                    },
                },
            })),

            setMessages: (threadId, messages, hasMore, append = false) => set((state) => ({
                threads: {
                    ...state.threads,
                    [threadId]: {
                        ...state.threads[threadId],
                        messages: append ? [...(state.threads[threadId]?.messages || []), ...messages] : messages,
                        hasMore,
                        currentPage: append ? (state.threads[threadId]?.currentPage || 1) : 1,
                    },
                },
            })),

            setInput: (threadId, input) => set((state) => ({
                threads: {
                    ...state.threads,
                    [threadId]: {
                        ...state.threads[threadId],
                        input,
                    },
                },
            })),

            setCurrentThreadId: (id) => set({ currentThreadId: id }),

            setUser: (user) => set({ user }),

            getThreadData: (threadId) => {
                const state = get();
                return state.threads[threadId] || { messages: [], input: '', hasMore: true, currentPage: 1 };
            },

            incrementPage: (threadId) => set((state) => ({
                threads: {
                    ...state.threads,
                    [threadId]: {
                        ...state.threads[threadId],
                        currentPage: (state.threads[threadId]?.currentPage || 1) + 1,
                    },
                },
            })),
        }),
        {
            name: 'chat-storage',
        }
    )
)
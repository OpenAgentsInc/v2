import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Message } from '@/types' // User

interface ThreadData {
    messages: Message[];
    input: string;
}

interface ChatState {
    threads: Record<string, ThreadData>;
    currentThreadId: string | undefined;
    // user: User | undefined;
    addMessage: (threadId: string, message: Message) => void;
    setMessages: (threadId: string, messages: Message[]) => void;
    setInput: (threadId: string, input: string) => void;
    setCurrentThreadId: (id: string | undefined) => void;
    // setUser: (user: User | undefined) => void;
    getThreadData: (threadId: string) => ThreadData;
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

            setMessages: (threadId, messages) => set((state) => ({
                threads: {
                    ...state.threads,
                    [threadId]: {
                        ...state.threads[threadId],
                        messages,
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

            // setUser: (user) => set({ user }),

            getThreadData: (threadId) => {
                const state = get();
                return state.threads[threadId] || { messages: [], input: '' };
            },
        }),
        {
            name: 'chat-storage',
        }
    )
)

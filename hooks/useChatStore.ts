import { create } from 'zustand';
import { Message } from '@/types';

interface User {
    id: string;
    name: string;
}

interface ThreadData {
    id: string;
    messages: Message[];
    input: string;
    user?: User;
}

interface ChatStore {
    currentThreadId: string | null;
    user: User | undefined;
    threads: Record<string, ThreadData>;
    setCurrentThreadId: (id: string) => void;
    setUser: (user: User) => void;
    getThreadData: (id: string) => ThreadData;
    setMessages: (id: string, messages: Message[]) => void;
    setInput: (id: string, input: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    currentThreadId: null,
    user: undefined,
    threads: {},
    setCurrentThreadId: (id: string) => set({ currentThreadId: id }),
    setUser: (user: User) => set({ user }),
    getThreadData: (id: string) => {
        const { threads } = get();
        if (!threads[id]) {
            threads[id] = { id, messages: [], input: '' };
        }
        return threads[id];
    },
    setMessages: (id: string, messages: Message[]) =>
        set(state => ({
            threads: {
                ...state.threads,
                [id]: { ...state.threads[id], messages }
            }
        })),
    setInput: (id: string, input: string) =>
        set(state => ({
            threads: {
                ...state.threads,
                [id]: { ...state.threads[id], input }
            }
        })),
}));
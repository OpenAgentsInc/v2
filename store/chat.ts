import { create } from 'zustand'
import { Message, User } from '@/lib/types'

interface ChatState {
    messages: Message[];
    input: string;
    id: string | undefined;
    user: User | undefined;
    addMessage: (message: Message) => void;
    setMessages: (messages: Message[]) => void;
    updateMessage: (id: string, updates: Partial<Message>) => void;
    clearMessages: () => void;
    setInput: (input: string) => void;
    setId: (id: string | undefined) => void;
    setUser: (user: User | undefined) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    messages: [],
    input: '',
    id: '1234',
    user: { id: 'guest' } as User,

    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),

    setMessages: (messages) => set({ messages }),

    updateMessage: (id, updates) => set((state) => ({
        messages: state.messages.map(msg =>
            msg.id === id ? { ...msg, ...updates } as Message : msg
        )
    })),

    clearMessages: () => set({ messages: [] }),

    setInput: (input) => set({ input }),

    setId: (id) => set({ id }),

    setUser: (user) => set({ user }),
}))

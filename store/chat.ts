import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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

export const useChatStore = create<ChatState>()(
    persist(
        (set) => ({
            messages: [],
            input: '',
            id: undefined,
            user: undefined,

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
        }),
        {
            name: 'chat-storage', // name of the item in the storage (must be unique)
        }
    )
)

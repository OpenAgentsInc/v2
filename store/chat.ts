import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Message, User } from '@/lib/types'

interface ChatData {
    messages: Message[];
    input: string;
}

interface ChatState {
    chats: Record<string, ChatData>;
    currentChatId: string | undefined;
    user: User | undefined;
    addMessage: (chatId: string, message: Message) => void;
    setMessages: (chatId: string, messages: Message[]) => void;
    setInput: (chatId: string, input: string) => void;
    setCurrentChatId: (id: string | undefined) => void;
    setUser: (user: User | undefined) => void;
    getChatData: (chatId: string) => ChatData;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            chats: {},
            currentChatId: undefined,
            user: undefined,

            addMessage: (chatId, message) => set((state) => ({
                chats: {
                    ...state.chats,
                    [chatId]: {
                        ...state.chats[chatId],
                        messages: [...(state.chats[chatId]?.messages || []), message],
                    },
                },
            })),

            setMessages: (chatId, messages) => set((state) => ({
                chats: {
                    ...state.chats,
                    [chatId]: {
                        ...state.chats[chatId],
                        messages,
                    },
                },
            })),

            setInput: (chatId, input) => set((state) => ({
                chats: {
                    ...state.chats,
                    [chatId]: {
                        ...state.chats[chatId],
                        input,
                    },
                },
            })),

            setCurrentChatId: (id) => set({ currentChatId: id }),

            setUser: (user) => set({ user }),

            getChatData: (chatId) => {
                const state = get();
                return state.chats[chatId] || { messages: [], input: '' };
            },
        }),
        {
            name: 'chat-storage',
        }
    )
)

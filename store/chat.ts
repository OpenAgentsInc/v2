import { create } from 'zustand'

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'function';
    content: string;
    createdAt: number;
}

interface StoreState {
    messages: Message[];
}

export const useChatStore = create<StoreState>((set) => ({

}))

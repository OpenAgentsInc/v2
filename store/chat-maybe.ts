import { create } from 'zustand';
import { ReactNode } from 'react';

// AIState types
interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'function';
    content: string;
    createdAt: number;
}

interface ChatMetadata {
    createdAt: number;
    userId: string;
    path: string;
}

interface AIState {
    messages: Message[];
    chatId: string;
    metadata: ChatMetadata;
}

// UIState types
interface UIMessage {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'function';
    display: ReactNode;
    createdAt: number;
}

interface UIState {
    uiMessages: UIMessage[];
    inputState: 'idle' | 'loading' | 'error';
    errorMessage?: string;
}

// Combined store state
interface StoreState {
    ai: AIState;
    ui: UIState;

    // AIState methods
    updateAIState: (newState: Partial<AIState>) => void;
    finalizeChatSession: (finalState: Partial<AIState>) => void;

    // UIState methods
    updateUIState: (newState: Partial<UIState>) => void;
    addUIMessage: (message: UIMessage) => void;
    setInputState: (state: UIState['inputState']) => void;
    setError: (message: string) => void;
}

export const useChatStore = create<StoreState>((set) => ({
    // AIState initial values
    ai: {
        messages: [],
        chatId: '',
        metadata: {
            createdAt: Date.now(),
            userId: '',
            path: '',
        },
    },

    // UIState initial values
    ui: {
        uiMessages: [],
        inputState: 'idle',
    },

    // AIState methods
    updateAIState: (newState) => set((state) => ({
        ai: { ...state.ai, ...newState }
    })),
    finalizeChatSession: (finalState) => set((state) => {
        // Here you would typically save the state to a database or perform other side effects
        console.log('Finalizing chat session:', { ...state.ai, ...finalState });
        return { ai: { ...state.ai, ...finalState } };
    }),

    // UIState methods
    updateUIState: (newState) => set((state) => ({
        ui: { ...state.ui, ...newState }
    })),
    addUIMessage: (message) => set((state) => ({
        ui: { ...state.ui, uiMessages: [...state.ui.uiMessages, message] }
    })),
    setInputState: (inputState) => set((state) => ({
        ui: { ...state.ui, inputState }
    })),
    setError: (errorMessage) => set((state) => ({
        ui: { ...state.ui, errorMessage, inputState: 'error' }
    })),
}));

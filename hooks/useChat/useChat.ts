import { create } from 'zustand';
import { useChat as useVercelChat, Message } from 'ai/react';
import { useRepoStore } from '@/store/repo'

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
    currentThreadId: string | undefined;
    user: User | undefined;
    threads: Record<string, ThreadData>;
    setCurrentThreadId: (id: string) => void;
    setUser: (user: User) => void;
    getThreadData: (id: string) => ThreadData;
    setMessages: (id: string, messages: Message[]) => void;
    setInput: (id: string, input: string) => void;
}

const useChatStore = create<ChatStore>((set, get) => ({
    currentThreadId: undefined,
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

interface UseChatProps {
    id?: string;
}

/**
 * @file hooks/useChat/useChat.ts
 * @description Chat hook with streaming support. Import as { useChat } from "@/hooks/useChat"
 */
export function useChat({ id: propsId }: UseChatProps = {}) {
    // Get repo data from the repo store
    const repo = useRepoStore((state) => state.repo)
    const {
        currentThreadId,
        user,
        setCurrentThreadId,
        setUser,
        getThreadData,
        setMessages,
        setInput: setStoreInput
    } = useChatStore();

    const id = propsId || currentThreadId || 'default';
    const threadData = getThreadData(id);

    const vercelChatProps = useVercelChat({
        id,
        initialMessages: threadData.messages,
        onFinish: (message) => {
            const updatedMessages = [...threadData.messages, message];
            setMessages(id, updatedMessages);
        },
        body: repo ? {
            repoOwner: repo.owner,
            repoName: repo.name,
            repoBranch: repo.branch,
        } : undefined,
        maxToolRoundtrips: 20
    });

    const setInput = (input: string) => {
        setStoreInput(id, input);
        vercelChatProps.setInput(input);
    };

    return {
        ...vercelChatProps,
        id,
        threadData,
        user,
        setCurrentThreadId,
        setUser,
        setInput,
    };
}

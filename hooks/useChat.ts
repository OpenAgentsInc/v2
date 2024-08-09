import { useCallback } from 'react';
import { create } from 'zustand';
import { useChat as useVercelChat, Message } from 'ai/react';
import { useModelStore } from '@/store/models';
import { useRepoStore } from '@/store/repo';
import { useToolStore } from '@/store/tools';
import { useThreadCreation } from './useThreadCreation';

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
    const model = useModelStore((state) => state.model);
    const repo = useRepoStore((state) => state.repo);
    const tools = useToolStore((state) => state.tools);

    const {
        currentThreadId,
        user,
        setCurrentThreadId,
        setUser,
        getThreadData,
        setMessages,
        setInput: setStoreInput
    } = useChatStore();

    const { threadId, createNewThread } = useThreadCreation(propsId || currentThreadId);
    const threadData = threadId ? getThreadData(threadId) : { messages: [], input: '' };

    console.log(`useChat initialized with propsId: ${propsId}, currentThreadId: ${currentThreadId}, threadId: ${threadId}`);

    // Build the body object with model, repo (if it exists), and tools
    const body: any = { model, tools, threadId };
    if (repo) {
        body.repoOwner = repo.owner;
        body.repoName = repo.name;
        body.repoBranch = repo.branch;
    }

    const vercelChatProps = useVercelChat({
        id: threadId,
        initialMessages: threadData.messages,
        body,
        maxToolRoundtrips: 20,
        onFinish: (message) => {
            if (threadId) {
                const updatedMessages = [...threadData.messages, message];
                setMessages(threadId, updatedMessages);
                console.log("useVercelChat onFinish with message:", message);
            }
        },
    });

    const sendMessage = useCallback(async (message: string) => {
        let currentThreadId = threadId;
        if (!currentThreadId) {
            currentThreadId = await createNewThread();
        }

        // Update local state first
        const userMessage = { content: message, role: 'user' as const };
        if (currentThreadId) {
            const updatedMessages = [...threadData.messages, userMessage];
            setMessages(currentThreadId, updatedMessages);
        }

        // Then use vercelChatProps.append
        return vercelChatProps.append(userMessage);
    }, [threadId, createNewThread, vercelChatProps, threadData.messages, setMessages]);

    const setInput = (input: string) => {
        if (threadId) {
            setStoreInput(threadId, input);
        }
        vercelChatProps.setInput(input);
    };

    return {
        ...vercelChatProps,
        id: threadId,
        threadData,
        user,
        setCurrentThreadId,
        setUser,
        setInput,
        sendMessage,
        createNewThread,
    };
}

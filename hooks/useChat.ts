import { useCallback, useEffect, useState } from 'react';
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

    const [threadId, setThreadId] = useState<string | null>(propsId || currentThreadId || null);

    const { threadId: createdThreadId, createNewThread } = useThreadCreation(threadId);

    useEffect(() => {
        if (propsId) {
            setThreadId(propsId);
            setCurrentThreadId(propsId);
        } else if (!threadId) {
            createNewThread();
        }
    }, [propsId, threadId, setCurrentThreadId, createNewThread]);

    useEffect(() => {
        if (createdThreadId && !threadId) {
            setThreadId(createdThreadId);
            setCurrentThreadId(createdThreadId);
        }
    }, [createdThreadId, threadId, setCurrentThreadId]);

    const threadData = threadId ? getThreadData(threadId) : { messages: [], input: '' };

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
            }
        },
    });

    const sendMessage = useCallback(async (message: string) => {
        if (!threadId) {
            console.error('No thread ID available');
            return;
        }

        const userMessage = { content: message, role: 'user' as const };
        const updatedMessages = [...threadData.messages, userMessage];
        setMessages(threadId, updatedMessages);

        return vercelChatProps.append(userMessage);
    }, [threadId, vercelChatProps, threadData.messages, setMessages]);

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
    };
}
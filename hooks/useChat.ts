import { useCallback, useEffect, useState } from 'react';
import { create } from 'zustand';
import { useChat as useVercelChat, Message } from 'ai/react';
import { useModelStore } from '@/store/models';
import { useRepoStore } from '@/store/repo';
import { useToolStore } from '@/store/tools';

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

    const [id, setId] = useState<string | null>(propsId || currentThreadId || null);
    const threadData = id ? getThreadData(id) : { messages: [], input: '' };

    // Function to create a new thread
    const createNewThread = useCallback(async () => {
        console.log("Attempting to create new thread...");
        try {
            const response = await fetch('/api/thread', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ /* any necessary data */ }),
            });
            if (!response.ok) throw new Error('Failed to create thread');
            const { threadId } = await response.json();
            setId(threadId);
            setCurrentThreadId(threadId);
            console.log("Set current thread id:", threadId);
            return threadId;
        } catch (error) {
            console.error('Error creating new thread:', error);
            throw error;
        }
    }, [setCurrentThreadId]);

    // Ensure we have a thread ID
    useEffect(() => {
        if (!id) {
            createNewThread();
        }
    }, [id, createNewThread]);

    // Build the body object with model, repo (if it exists), and tools
    const body: any = { model, tools, threadId: id };
    if (repo) {
        body.repoOwner = repo.owner;
        body.repoName = repo.name;
        body.repoBranch = repo.branch;
    }

    const vercelChatProps = useVercelChat({
        id,
        initialMessages: threadData.messages,
        body,
        maxToolRoundtrips: 20,
        onFinish: (message) => {
            if (id) {
                const updatedMessages = [...threadData.messages, message];
                setMessages(id, updatedMessages);
                console.log("useVercelChat onFinish with message:", message);
            }
        },
    });

    const sendMessage = useCallback(async (message: string) => {
        let currentId = id;
        if (!currentId) {
            currentId = await createNewThread();
        }

        // Update local state first
        const userMessage = { content: message, role: 'user' as const };
        if (currentId) {
            const updatedMessages = [...threadData.messages, userMessage];
            setMessages(currentId, updatedMessages);
        }

        // Then use vercelChatProps.append
        return vercelChatProps.append(userMessage);
    }, [id, createNewThread, vercelChatProps, threadData.messages, setMessages]);

    const setInput = (input: string) => {
        if (id) {
            setStoreInput(id, input);
        }
        vercelChatProps.setInput(input);
    };

    useEffect(() => {
        if (id) {
            setCurrentThreadId(id);
        }
    }, [id, setCurrentThreadId]);

    return {
        ...vercelChatProps,
        id,
        threadData,
        user,
        setCurrentThreadId,
        setUser,
        setInput,
        sendMessage,
        createNewThread,
    };
}


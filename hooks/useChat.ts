import { useCallback, useEffect, useState } from 'react';
import { create } from 'zustand';
import { useChat as useVercelChat, Message as VercelMessage } from 'ai/react';
import { useModelStore } from '@/store/models';
import { useRepoStore } from '@/store/repo';
import { useToolStore } from '@/store/tools';
import { ChatMessage, ServerMessage, ClientMessage } from '@/lib/types';
import { createNewThread, fetchThreadMessages, saveMessage } from '@/db/actions';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

interface User {
    id: string;
    name: string;
}

interface ThreadData {
    id: number;
    messages: ChatMessage[];
    input: string;
    user?: User;
    hasMore: boolean;
    currentPage: number;
}

interface ChatStore {
    currentThreadId: number | null;
    user: User | undefined;
    threads: Record<number, ThreadData>;
    setCurrentThreadId: (id: number) => void;
    setUser: (user: User) => void;
    getThreadData: (id: number) => ThreadData;
    setMessages: (id: number, messages: ChatMessage[], hasMore: boolean, append?: boolean) => void;
    setInput: (id: number, input: string) => void;
    incrementPage: (id: number) => void;
}

const useChatStore = create<ChatStore>((set, get) => ({
    currentThreadId: null,
    user: undefined,
    threads: {},
    setCurrentThreadId: (id: number) => set({ currentThreadId: id }),
    setUser: (user: User) => set({ user }),
    getThreadData: (id: number) => {
        const { threads } = get();
        if (!threads[id]) {
            threads[id] = { id, messages: [], input: '', hasMore: true, currentPage: 1 };
        }
        return threads[id];
    },
    setMessages: (id: number, messages: ChatMessage[], hasMore: boolean, append = false) =>
        set(state => ({
            threads: {
                ...state.threads,
                [id]: {
                    ...state.threads[id],
                    messages: append ? [...state.threads[id].messages, ...messages] : messages,
                    hasMore,
                    currentPage: append ? state.threads[id].currentPage : 1
                }
            }
        })),
    setInput: (id: number, input: string) =>
        set(state => ({
            threads: {
                ...state.threads,
                [id]: { ...state.threads[id], input }
            }
        })),
    incrementPage: (id: number) =>
        set(state => ({
            threads: {
                ...state.threads,
                [id]: { ...state.threads[id], currentPage: state.threads[id].currentPage + 1 }
            }
        })),
}));

interface UseChatProps {
    id?: number;
}

export function useChat({ id: propsId }: UseChatProps = {}) {
    const model = useModelStore((state) => state.model);
    const repo = useRepoStore((state) => state.repo);
    const tools = useToolStore((state) => state.tools);
    const { user } = useUser();

    const {
        currentThreadId,
        setCurrentThreadId,
        setUser,
        getThreadData,
        setMessages,
        setInput: setStoreInput,
        incrementPage
    } = useChatStore();

    const [threadId, setThreadId] = useState<number | null>(propsId || currentThreadId);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (propsId) {
            setThreadId(propsId);
            setCurrentThreadId(propsId);
        } else if (!threadId && user) {
            createNewThread(user.id)
                .then(({ threadId: newThreadId }) => {
                    setThreadId(newThreadId);
                    setCurrentThreadId(newThreadId);
                })
                .catch(error => {
                    console.error('Error creating new thread:', error);
                    toast.error('Failed to create a new chat thread. Please try again.');
                });
        }
    }, [propsId, threadId, setCurrentThreadId, user]);

    const fetchMessages = useCallback(async (page = 1, limit = 10) => {
        if (!threadId) return;
        setIsLoading(true);
        try {
            const { messages, hasMore } = await fetchThreadMessages(threadId, page, limit);
            setMessages(threadId, messages, hasMore, page > 1);
        } catch (error) {
            console.error('Error fetching thread messages:', error);
            toast.error('Failed to load chat messages. Please try refreshing the page.');
        } finally {
            setIsLoading(false);
        }
    }, [threadId, setMessages]);

    useEffect(() => {
        if (threadId) {
            fetchMessages();
        }
    }, [threadId, fetchMessages]);

    const threadData = threadId ? getThreadData(threadId) : { messages: [], input: '', hasMore: false, currentPage: 1 };

    const body: any = { model, tools, threadId };
    if (repo) {
        body.repoOwner = repo.owner;
        body.repoName = repo.name;
        body.repoBranch = repo.branch;
    }

    const adaptMessage = (message: VercelMessage): ChatMessage => {
        const baseMessage = {
            id: message.id,
            content: message.content,
        };

        if (message.role === 'user') {
            return { ...baseMessage, role: 'user' } as ClientMessage;
        } else {
            return { ...baseMessage, role: message.role as ServerMessage['role'] } as ServerMessage;
        }
    };

    const vercelChatProps = useVercelChat({
        id: threadId?.toString(),
        initialMessages: threadData.messages as VercelMessage[],
        body,
        maxToolRoundtrips: 20,
        onFinish: async (message) => {
            if (threadId && user) {
                const adaptedMessage = adaptMessage(message);
                const updatedMessages = [...threadData.messages, adaptedMessage];
                setMessages(threadId, updatedMessages, threadData.hasMore);
                
                try {
                    await saveMessage(threadId, user.id, adaptedMessage);
                } catch (error) {
                    console.error('Error saving AI message:', error);
                    toast.error('Failed to save AI response. Some messages may be missing.');
                }
            }
        },
        onError: (error) => {
            console.error('Error in chat:', error);
            toast.error('An error occurred while processing your request. Please try again.');
        },
    });

    const sendMessage = useCallback(async (message: string) => {
        if (!threadId || !user) {
            console.error('No thread ID or user available');
            toast.error('Unable to send message. Please try refreshing the page.');
            return;
        }

        const userMessage: ClientMessage = { id: Date.now().toString(), content: message, role: 'user' };
        const updatedMessages = [...threadData.messages, userMessage];
        setMessages(threadId, updatedMessages, threadData.hasMore);

        try {
            // Optimistically update the UI
            vercelChatProps.append(userMessage as VercelMessage);

            // Save the message to the database
            await saveMessage(threadId, user.id, userMessage);

            // Ensure the last message is a user message before sending a new request
            const filteredMessages = updatedMessages.filter(msg => msg.role === 'user' || msg.role === 'assistant');
            const lastUserMessage = filteredMessages.filter(msg => msg.role === 'user').pop();
            if (lastUserMessage !== userMessage) {
                console.warn('Last message is not the current user message. Adjusting messages for the API request.');
                const lastUserIndex = filteredMessages.lastIndexOf(lastUserMessage!);
                vercelChatProps.setMessages(filteredMessages.slice(0, lastUserIndex + 1) as VercelMessage[]);
            }

            // Trigger the API request
            await vercelChatProps.reload();
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message. Please try again.');
            // Revert the optimistic update
            setMessages(threadId, threadData.messages, threadData.hasMore);
        }
    }, [threadId, user, vercelChatProps, threadData.messages, threadData.hasMore, setMessages]);

    const setInput = (input: string) => {
        if (threadId) {
            setStoreInput(threadId, input);
        }
        vercelChatProps.setInput(input);
    };

    const loadMoreMessages = useCallback(async () => {
        if (threadId && threadData.hasMore && !isLoading) {
            incrementPage(threadId);
            await fetchMessages(threadData.currentPage + 1);
        }
    }, [threadId, threadData.hasMore, threadData.currentPage, isLoading, incrementPage, fetchMessages]);

    const adaptedMessages = vercelChatProps.messages.map(adaptMessage);

    return {
        ...vercelChatProps,
        messages: adaptedMessages,
        id: threadId,
        threadData,
        user,
        setCurrentThreadId,
        setUser,
        setInput,
        sendMessage,
        loadMoreMessages,
        isLoading,
    };
}
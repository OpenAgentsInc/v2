"use client"

import { useCallback, useEffect, useState, useRef } from 'react';
import { create } from 'zustand';
import { useChat as useVercelChat, Message as VercelMessage } from 'ai/react';
import { useBalanceStore } from '@/store/balance';
import { useModelStore } from '@/store/models';
import { useRepoStore } from '@/store/repo';
import { useToolStore } from '@/store/tools';
import { Message, OnFinishOptions } from '@/types';
import { createNewThread, fetchThreadMessages, saveChatMessage } from '@/db/actions';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

interface User {
    id: string;
    name: string;
}

interface ThreadData {
    id: number;
    messages: Message[];
    input: string;
    user?: User;
}

interface ChatStore {
    currentThreadId: number | null;
    user: User | undefined;
    threads: Record<number, ThreadData>;
    setCurrentThreadId: (id: number) => void;
    setUser: (user: User) => void;
    getThreadData: (id: number) => ThreadData;
    setMessages: (id: number, messages: Message[]) => void;
    setInput: (id: number, input: string) => void;
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
            threads[id] = { id, messages: [], input: '' };
        }
        return threads[id];
    },
    setMessages: (id: number, messages: Message[]) =>
        set(state => ({
            threads: {
                ...state.threads,
                [id]: { ...state.threads[id], messages }
            }
        })),
    setInput: (id: number, input: string) =>
        set(state => ({
            threads: {
                ...state.threads,
                [id]: { ...state.threads[id], input }
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
    const setBalance = useBalanceStore((state) => state.setBalance);
    const { user } = useUser();
    const [error, setError] = useState<string | null>(null);

    const {
        currentThreadId,
        setCurrentThreadId,
        setUser,
        getThreadData,
        setMessages,
        setInput: setStoreInput
    } = useChatStore();

    const [threadId, setThreadId] = useState<number | null>(propsId || currentThreadId);
    const currentModelRef = useRef(model);

    useEffect(() => {
        currentModelRef.current = model;
    }, [model]);

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

    useEffect(() => {
        if (threadId) {
            fetchThreadMessages(threadId)
                .then((messages) => {
                    setMessages(threadId, messages);
                })
                .catch(error => {
                    console.error('Error fetching thread messages:', error);
                    toast.error('Failed to load chat messages. Please try refreshing the page.');
                });
        }
    }, [threadId, setMessages]);

    const threadData = threadId ? getThreadData(threadId) : { messages: [], input: '' };

    const body: any = { model, tools, threadId };
    if (repo) {
        body.repoOwner = repo.owner;
        body.repoName = repo.name;
        body.repoBranch = repo.branch;
    }

    const vercelChatProps = useVercelChat({
        id: threadId?.toString(),
        initialMessages: threadData.messages as VercelMessage[],
        body,
        maxToolRoundtrips: 20,
        onFinish: async (message, options) => {
            console.log('useChat onFinish', message, options);
            if (threadId && user) {
                const updatedMessages = [...threadData.messages, message as Message];
                setMessages(threadId, updatedMessages);

                try {
                    const result = await saveChatMessage(threadId, user.id, message as Message, {
                        ...options,
                        model: currentModelRef.current
                    });
                    console.log('New user balance after message:', result.newBalance);
                    setBalance(result.newBalance || 0);
                    setError(null); // Clear any previous errors
                } catch (error) {
                    // console.error('Error saving AI message!!!!:', error);
                    console.log('error message is:', error.message);
                    if (error instanceof Error && error.message === 'Insufficient credits') {
                        setError('Insufficient credits. Please add more credits to continue chatting.');
                        toast.error('Insufficient credits. Please add more credits to continue chatting.');
                    } else {
                        setError('Failed to save AI response. Some messages may be missing.');
                        toast.error('Failed to save AI response. Some messages may be missing.');
                    }
                }
            }
        },
        onError: (error) => {
            if (error.message === 'Insufficient credits') {
                setError('Insufficient credits. Please add more credits to continue chatting.');
                toast.error('Insufficient credits. Please add more credits to continue chatting.');
            } else {
                setError('An error occurred while processing your request. Please try again.');
                toast.error('An error occurred. Please try again.');
            }
        },
    });

    const sendMessage = useCallback(async (message: string) => {
        if (!threadId || !user) {
            console.error('No thread ID or user available');
            return;
        }

        const userMessage: Message = { id: Date.now().toString(), content: message, role: 'user' };
        const updatedMessages = [...threadData.messages, userMessage];
        setMessages(threadId, updatedMessages);

        try {
            // Optimistically update the UI
            vercelChatProps.append(userMessage as VercelMessage);

            // Save the message to the database
            await saveChatMessage(threadId, user.id, userMessage);
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message. Please try again.');
            // Revert the optimistic update
            setMessages(threadId, threadData.messages);
        }
    }, [threadId, user, vercelChatProps, threadData.messages, setMessages]);

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
        error
    };
}

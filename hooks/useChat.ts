"use client"

import { useCallback, useEffect, useState, useRef } from 'react';
import { create } from 'zustand';
import { useChat as useVercelChat, Message as VercelMessage } from 'ai/react';
import { useBalanceStore } from '@/store/balance';
import { useModelStore } from '@/store/models';
import { useRepoStore } from '@/store/repo';
import { useToolStore } from '@/store/tools';
import { Message, Model } from '@/types';
import { createNewThread, fetchThreadMessages, saveChatMessage } from '@/db/actions';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { useDebounce } from 'use-debounce';

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
            createNewThread()
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

    const body: any = { model: model.id, tools, threadId };
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
            if (threadId && user) {
                const updatedMessages = [...threadData.messages, message as Message];
                setMessages(threadId, updatedMessages);

                try {
                    const result = await saveChatMessage(threadId, user.id, message as Message, {
                        ...options,
                        model: currentModelRef.current
                    });
                    if (result.newBalance) {
                        setBalance(result.newBalance);
                    }
                    setError(null);

                    // New check for message count and title
                    if (updatedMessages.length >= 2) {
                        console.log("Placeholder function: Message count > 2 and title is 'New Chat'");
                        console.log("threadData is ", threadData);
                        // You can replace this console.log with an actual function call
                        // For example: updateChatTitle(threadId);
                    }


                } catch (error: any) {
                    console.log('error message is:', error.message);
                    if (error instanceof Error && error.message === 'Insufficient credits') {
                        toast.error('Insufficient credits. Please add more credits to continue chatting.');
                    } else {
                        toast.error('Unknown error. Try again or try a different model.');
                    }
                }
            }
        },
        onError: (error) => {
            if (error.message === 'Insufficient credits') {
                toast.error('Insufficient credits. Please add more credits to continue chatting.');
            } else {
                setError('Error :(');
                toast.error('Unknown error. Try again or try a different model.');
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
            vercelChatProps.append(userMessage as VercelMessage);
            await saveChatMessage(threadId, user.id, userMessage);
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message. Please try again.');
            setMessages(threadId, threadData.messages);
        }
    }, [threadId, user, vercelChatProps, threadData.messages, setMessages]);

    const setInput = (input: string) => {
        if (threadId) {
            setStoreInput(threadId, input);
        }
        vercelChatProps.setInput(input);
    };

    const [debouncedMessages] = useDebounce(vercelChatProps.messages, 250, { maxWait: 250 });

    return {
        ...vercelChatProps,
        messages: debouncedMessages,
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

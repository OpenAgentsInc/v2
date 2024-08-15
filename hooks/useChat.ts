"use client"

import { useEffect, useRef, useState } from 'react';
import { useChat as useVercelChat, Message as VercelMessage } from 'ai/react';
import { useConvex, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useBalanceStore } from '@/store/balance';
import { useModelStore } from '@/store/models';
import { useRepoStore } from '@/store/repo';
import { useToolStore } from '@/store/tools';
import { Message } from '@/types/message';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { useDebounce } from 'use-debounce';
import { useChatStore as useNewChatStore } from '@/store/chat';
import { useChatStore } from './useChatStore';
import { useThreadManagement } from './useThreadManagement';
import { useMessageHandling } from './useMessageHandling';
import { Id } from '../convex/_generated/dataModel';

interface UseChatProps {
    id?: string;
}

export function useChat({ id: propsId }: UseChatProps = {}) {
    const convex = useConvex();
    const model = useModelStore((state) => state.model);
    const repo = useRepoStore((state) => state.repo);
    const tools = useToolStore((state) => state.tools);
    const setBalance = useBalanceStore((state) => state.setBalance);
    const { user } = useUser();
    const [error, setError] = useState<string | null>(null);
    const updateThreadTitle = useNewChatStore((state) => state.updateThreadTitle);

    const {
        setUser,
        getThreadData,
        setMessages,
        setInput: setStoreInput
    } = useChatStore();

    const threadManagement = useThreadManagement(propsId);
    const threadId = threadManagement?.threadId ?? null;
    const setThreadId = threadManagement?.setThreadId ?? (() => {});
    const currentModelRef = useRef(model);

    useEffect(() => {
        currentModelRef.current = model;
    }, [model]);

    const messages = useQuery(api.messages.fetchThreadMessages, threadId ? { thread_id: threadId } : "skip");
    const threadData = threadId ? { messages: messages || [], input: '' } : { messages: [], input: '' };

    const body: any = { model: model.id, tools, threadId };
    if (repo) {
        body.repoOwner = repo.owner;
        body.repoName = repo.name;
        body.repoBranch = repo.branch;
    }

    const saveMessageAndUpdateBalance = async (message: Message, options: any) => {
        if (threadId && user) {
            const updatedMessages = [...threadData.messages, message].map(msg => ({
                ...msg,
                role: msg.role as 'system' | 'user' | 'assistant' | 'data'
            }));
            setMessages(threadId, updatedMessages as Message[]);

            try {
                const result = await convex.mutation(api.users.saveMessageAndUpdateBalance, {
                    clerk_user_id: user.id,
                    model_id: currentModelRef.current.id,
                    usage: {
                        promptTokens: options.usage?.promptTokens || 0,
                        completionTokens: options.usage?.completionTokens || 0,
                        totalTokens: options.usage?.totalTokens || 0,
                    },
                }) as { cost_in_cents: number, newBalance: number } | null;

                if (result) {
                    setBalance(result.newBalance);
                }
                setError(null);

                // Save the message to the database
                await convex.mutation(api.messages.saveChatMessage, {
                    thread_id: threadId,
                    clerk_user_id: user.id,
                    role: message.role,
                    content: message.content,
                    tool_invocations: options.toolInvocations ? JSON.stringify(options.toolInvocations) : undefined,
                    finish_reason: options.finishReason,
                    total_tokens: options.usage?.totalTokens,
                    prompt_tokens: options.usage?.promptTokens,
                    completion_tokens: options.usage?.completionTokens,
                    model_id: currentModelRef.current.id,
                    cost_in_cents: result?.cost_in_cents,
                });

            } catch (error: any) {
                if (error instanceof Error && error.message === 'Insufficient credits') {
                    toast.error('Insufficient credits. Please add more credits to continue chatting.');
                } else {
                    toast.error('Unknown error. Try again or try a different model.');
                }
            }
        }
    };

    const vercelChatProps = useVercelChat({
        id: threadId,
        initialMessages: messages as unknown as VercelMessage[],
        body,
        maxToolRoundtrips: 20,
        onFinish: async (message, options) => {
            await saveMessageAndUpdateBalance(message as unknown as Message, options);
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

    const { sendMessage } = useMessageHandling(threadId, vercelChatProps, user?.id || '');

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
        setThreadId,
        setUser,
        setInput,
        sendMessage,
        error
    };
}
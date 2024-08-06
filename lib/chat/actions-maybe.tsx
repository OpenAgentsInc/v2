import { createAI, createStreamableUI, createStreamableValue, getAIState, getMutableAIState, streamUI } from 'ai/rsc';
import { nanoid } from '@/lib/utils';
import { Chat, Message, Repo, ServerMessage, ClientMessage } from '@/lib/types';
import { BotMessage } from '@/components/stocks';
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import React from 'react';

export type AIState = {
    chatId: string;
    messages: Message[];
}

export type UIState = {
    id: string;
    display: React.ReactNode;
}[]

// Function to submit user message and continue the conversation
async function submitUserMessage(content: string) {
    'use server'

    const aiState = getMutableAIState<typeof AI>();

    aiState.update({
        ...aiState.get(),
        messages: [
            ...aiState.get().messages,
            {
                id: nanoid(),
                role: 'user',
                content
            }
        ]
    });

    let textStream: ReturnType<typeof createStreamableValue<string>> | undefined;
    let textNode: React.ReactNode | undefined;

    const result = await streamUI({
        initial: <SpinnerMessage />,
        generate: async function*() {
            // Simulate AI response generation
            yield "This is ";
            await new Promise(resolve => setTimeout(resolve, 500));
            yield "a simulated ";
            await new Promise(resolve => setTimeout(resolve, 500));
            yield "AI response.";
        },
        render: ({ content, done, delta }) => {
            if (!textStream) {
                textStream = createStreamableValue('');
                textNode = <BotMessage content={textStream.value} />;
            }

            if (done) {
                textStream.done();
                aiState.done({
                    ...aiState.get(),
                    messages: [
                        ...aiState.get().messages,
                        {
                            id: nanoid(),
                            role: 'assistant',
                            content
                        }
                    ]
                });
            } else {
                textStream.update(content);
            }

            return textNode;
        }
    });

    return {
        id: nanoid(),
        display: result.value
    };
}

// Create the AI context
export const AI = createAI<AIState, UIState>({
    actions: {
        submitUserMessage,
    },
    initialAIState: {
        chatId: nanoid(),
        messages: [],
    },
    initialUIState: [],
    onSetAIState: async ({ state, done }) => {
        'use server';
        if (done) {
            // Save chat to database (implement this function)
            // await saveChatToDB(state);
        }
    },
    onGetUIState: async () => {
        'use server';
        const aiState = getAIState() as Chat
        if (aiState) {
            const uiState = getUIStateFromAIState(aiState)
            return uiState
        } else {
            return []
        }
    }
});

export default AI;

const getUIStateFromAIState = (aiState: Chat): UIState => {
    return aiState.messages
        .filter(message => message.role !== 'system')
        .flatMap((message, index) => {
            const displays: React.ReactNode[] = [];
            if (message.role === 'user') {
                displays.push(<UserMessage key={index}>{message.content as string}</UserMessage>);
            } else if (message.role === 'assistant') {
                displays.push(<BotMessage key={index} content={message.content as string} />);
            }
            return displays.map((display) => ({
                id: message.id,
                display
            }));
        });
};

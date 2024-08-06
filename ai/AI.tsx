import 'server-only';
import React from 'react';
import { createAI, getMutableAIState, getAIState, streamUI } from 'ai/rsc';
import { nanoid } from 'nanoid';
import { AIState, Message } from './AIState';
import { UIState, UIMessage } from './UIState';
import { openai } from '@ai-sdk/openai';
import { BotMessage } from '@/components/stocks';
import { saveChat } from '@/app/actions';
import { auth } from '@/auth';
import { tools } from './tools';
import { createStreamableValue } from './streamableValue';
import { systemPrompt } from './systemPrompt';
import { renderMessageContent } from './renderMessageContent';

/**
 * Submits a user message and generates an AI response.
 * @param content The content of the user's message.
 * @returns A Promise resolving to a UIMessage object.
 */
async function submitUserMessage(content: string): Promise<UIMessage> {
  'use server';

  const aiState = getMutableAIState<typeof AI>();

  // Update the AI state with the new user message
  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content,
        createdAt: Date.now()
      }
    ]
  });

  let textStream: ReturnType<typeof createStreamableValue<string>> | undefined;
  let textNode: React.ReactNode | undefined;

  const result = await streamUI({
    model: openai('gpt-4o'),
    initial: <div>Loading...</div>,
    system: systemPrompt,
    messages: [
      ...aiState.get().messages.map((message: Message) => ({
        role: message.role,
        content: message.content
      }))
    ],
    text: ({ content, done, delta }) => {
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
              content,
              createdAt: Date.now()
            }
          ]
        });
      } else {
        textStream.update(delta);
      }

      return textNode;
    },
    tools
  });

  return {
    id: nanoid(),
    role: 'assistant',
    display: result.value,
    createdAt: Date.now()
  };
}

/**
 * The main AI component that manages the chat state and UI.
 */
export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage
  },
  initialAIState: {
    chatId: nanoid(),
    messages: [],
    metadata: {
      createdAt: Date.now(),
      userId: '',
      path: ''
    }
  },
  initialUIState: {
    messages: [{
      id: nanoid(),
      role: 'system',
      display: <div>Welcome to the chat!</div>,
      createdAt: Date.now(),
    }],
    inputState: 'idle',
  },
  onSetAIState: async ({ state }) => {
    'use server';
    const session = await auth();
    if (session) {
      const { chatId, messages } = state;
      const createdAt = new Date();
      const userId = session.userId as string;
      const path = `/chat/${chatId}`;
      const firstMessageContent = messages[0]?.content as string || '';
      const title = firstMessageContent.substring(0, 100);
      const chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path,
        metadata: state.metadata
      };
      await saveChat(chat);
    }
  },
  onGetUIState: async () => {
    'use server';
    const session = await auth();
    if (session) {
      const aiState = getAIState();
      if (aiState) {
        return getUIStateFromAIState(aiState);
      }
    }
    return undefined;
  }
});

/**
 * Converts the AI state to UI state.
 * @param aiState The current AI state.
 * @returns The corresponding UI state.
 */
function getUIStateFromAIState(aiState: AIState): UIState {
  return {
    messages: aiState.messages
      .filter((message: Message) => message.role !== 'system')
      .map((message: Message): UIMessage => ({
        id: nanoid(),
        role: message.role,
        display: renderMessageContent(message),
        createdAt: message.createdAt
      })),
    inputState: 'idle'
  };
}

export { submitUserMessage };
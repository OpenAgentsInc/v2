import 'server-only';
import React from 'react';
import { createAI, getMutableAIState, getAIState, streamUI } from 'ai/rsc';
import { nanoid } from 'nanoid';
import { AIState, Message, Chat } from './AIState';
import { UIState, UIMessage } from './UIState';
import { openai } from '@ai-sdk/openai';
import { BotMessage } from '@/components/stocks';
import { saveChat } from '@/app/actions';
import { auth } from '@/auth';
import { tools } from './tools';
import { createStreamableValue } from './streamableValue';
import { systemPrompt } from './systemPrompt';
import { renderMessageContent } from './renderMessageContent';

async function submitUserMessage(content: string): Promise<UIMessage> {
  'use server';

  const aiState = getMutableAIState<typeof AI>();

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
        content: message.content,
        name: message.name
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
      const chat: Chat = {
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
      const aiState = getAIState() as Chat;
      if (aiState) {
        return getUIStateFromAIState(aiState);
      }
    }
    return undefined;
  }
});

function getUIStateFromAIState(aiState: Chat): UIState {
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
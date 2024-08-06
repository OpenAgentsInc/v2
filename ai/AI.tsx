import 'server-only';
import React from 'react';
import { createAI, getMutableAIState, getAIState, streamUI } from 'ai/rsc';
import { nanoid } from 'nanoid';
import { AIState, Message, Chat } from './AIState';
import { UIState, UIMessage } from './UIState';
import { openai } from '@ai-sdk/openai';
import { SpinnerMessage } from '../components/SpinnerMessage';
import { BotMessage, UserMessage } from '../components/Message';
import { saveChat } from '../app/actions';
import { auth } from '../auth';
import { tools } from './tools';
import { createStreamableValue } from './streamableValue';

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
        content
      }
    ]
  });

  let textStream: ReturnType<typeof createStreamableValue<string>> | undefined;
  let textNode: React.ReactNode | undefined;

  const result = await streamUI({
    model: openai('gpt-4o'),
    initial: <SpinnerMessage />,
    system: `\
You are a stock trading conversation bot and you can help users buy stocks, step by step.
You and the user can discuss stock prices and the user can adjust the amount of stocks they want to buy, or place an order, in the UI.

Messages inside [] means that it's a UI element or a user event. For example:
- "[Price of AAPL = 100]" means that an interface of the stock price of AAPL is shown to the user.
- "[User has changed the amount of AAPL to 10]" means that the user has changed the amount of AAPL to 10 in the UI.

If the user requests purchasing a stock, call \`show_stock_purchase_ui\` to show the purchase UI.
If the user just wants the price, call \`show_stock_price\` to show the price.
If you want to show trending stocks, call \`list_stocks\`.
If you want to show events, call \`get_events\`.
If the user wants to sell stock, or complete another impossible task, respond that you are a demo and cannot do that.

Besides that, you can also chat with users and do some calculations if needed.`,
    messages: [
      ...aiState.get().messages.map((message: any) => ({
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
              content
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
    display: result.value
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
      display: <SpinnerMessage />,
      createdAt: Date.now(),
    }],
    inputState: 'idle',
  },
  onSetAIState: async ({ state }) => {
    'use server';
    const session = await auth();
    if (session && session.user) {
      const { chatId, messages } = state;
      const createdAt = new Date();
      const userId = session.user.id as string;
      const path = `/chat/${chatId}`;
      const firstMessageContent = messages[0].content as string;
      const title = firstMessageContent.substring(0, 100);
      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path
      };
      await saveChat(chat);
    }
  },
  onGetUIState: async () => {
    'use server';
    const session = await auth();
    if (session && session.user) {
      const aiState = getAIState() as Chat;
      if (aiState) {
        return getUIStateFromAIState(aiState);
      }
    }
    return undefined;
  }
});

export function getUIStateFromAIState(aiState: Chat): UIState {
  return {
    messages: aiState.messages
      .filter(message => message.role !== 'system')
      .map((message): UIMessage => ({
        id: nanoid(),
        role: message.role,
        display: renderMessageContent(message),
        createdAt: message.createdAt
      })),
    inputState: 'idle'
  };
}

function renderMessageContent(message: Message): React.ReactNode {
  switch (message.role) {
    case 'user':
      return <UserMessage>{message.content as string}</UserMessage>;
    case 'assistant':
      return <BotMessage content={message.content as string} />;
    case 'tool':
      // Implement tool message rendering based on the tool type
      return null; // Placeholder
    default:
      return null;
  }
}

export { submitUserMessage, getUIStateFromAIState };
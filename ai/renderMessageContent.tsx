import React from 'react';
import { Message } from './AIState';
import { BotMessage, BotCard } from '@/components/stocks';
import { Stocks } from '@/components/stocks/stocks';
import { Stock } from '@/components/stocks/stock';
import { Purchase } from '@/components/stocks';
import { Events } from '@/components/stocks/events';

/**
 * Renders the content of a message based on its role and content.
 * @param message The message object to render.
 * @returns A React node representing the rendered message content.
 */
export function renderMessageContent(message: Message): React.ReactNode {
  switch (message.role) {
    case 'user':
      return <div>{message.content}</div>;
    case 'assistant':
      return <BotMessage content={message.content as string} />;
    case 'function':
      if (Array.isArray(message.content)) {
        return message.content.map(tool => {
          switch (tool.toolName) {
            case 'listStocks':
              return (
                <BotCard key={tool.toolCallId}>
                  <Stocks props={tool.result} />
                </BotCard>
              );
            case 'showStockPrice':
              return (
                <BotCard key={tool.toolCallId}>
                  <Stock props={tool.result} />
                </BotCard>
              );
            case 'showStockPurchase':
              return (
                <BotCard key={tool.toolCallId}>
                  <Purchase props={tool.result} />
                </BotCard>
              );
            case 'getEvents':
              return (
                <BotCard key={tool.toolCallId}>
                  <Events props={tool.result} />
                </BotCard>
              );
            default:
              return null;
          }
        });
      }
      return null;
    default:
      return null;
  }
}
import React from 'react';
import { Message } from './AIState';
import { BotMessage, UserMessage } from '../components/Message';
import { BotCard } from '../components/BotCard';
import { Stocks } from '../components/stocks/Stocks';
import { Stock } from '../components/stocks/Stock';
import { Purchase } from '../components/stocks/Purchase';
import { Events } from '../components/stocks/Events';

export function renderMessageContent(message: Message): React.ReactNode {
  switch (message.role) {
    case 'user':
      return <UserMessage>{message.content as string}</UserMessage>;
    case 'assistant':
      return <BotMessage content={message.content as string} />;
    case 'tool':
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
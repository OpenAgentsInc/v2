import { z } from 'zod';
import { nanoid } from 'nanoid';
import { BotCard } from '@/components/stocks';
import { Stocks } from '@/components/stocks/stocks';
import { Stock } from '@/components/stocks/stock-skeleton';
import { Events } from '@/components/stocks/events';
import { Purchase } from '@/components/stocks';
import { sleep } from '@/lib/utils';

export const tools = {
  listStocks: {
    description: 'List three imaginary stocks that are trending.',
    parameters: z.object({
      stocks: z.array(
        z.object({
          symbol: z.string().describe('The symbol of the stock'),
          price: z.number().describe('The price of the stock'),
          delta: z.number().describe('The change in price of the stock')
        })
      )
    }),
    generate: async function*({ stocks }: { stocks: any[] }) {
      yield (
        <BotCard>
          <div>Loading stocks...</div>
        </BotCard>
      );

      await sleep(1000);

      const toolCallId = nanoid();

      return (
        <BotCard>
          <Stocks props={stocks} />
        </BotCard>
      );
    }
  },
  showStockPrice: {
    description:
      'Get the current stock price of a given stock or currency. Use this to show the price to the user.',
    parameters: z.object({
      symbol: z
        .string()
        .describe(
          'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
        ),
      price: z.number().describe('The price of the stock.'),
      delta: z.number().describe('The change in price of the stock')
    }),
    generate: async function*({ symbol, price, delta }: { symbol: string, price: number, delta: number }) {
      yield (
        <BotCard>
          <div>Loading stock price...</div>
        </BotCard>
      );

      await sleep(1000);

      return (
        <BotCard>
          <Stock props={{ symbol, price, delta }} />
        </BotCard>
      );
    }
  },
  showStockPurchase: {
    description:
      'Show price and the UI to purchase a stock or currency. Use this if the user wants to purchase a stock or currency.',
    parameters: z.object({
      symbol: z
        .string()
        .describe(
          'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
        ),
      price: z.number().describe('The price of the stock.'),
      numberOfShares: z
        .number()
        .optional()
        .describe(
          'The **number of shares** for a stock or currency to purchase. Can be optional if the user did not specify it.'
        )
    }),
    generate: async function*({ symbol, price, numberOfShares = 100 }: { symbol: string, price: number, numberOfShares?: number }) {
      if (numberOfShares <= 0 || numberOfShares > 1000) {
        return <BotCard>Invalid amount</BotCard>;
      } else {
        return (
          <BotCard>
            <Purchase
              props={{
                numberOfShares,
                symbol,
                price: +price,
                status: 'requires_action'
              }}
            />
          </BotCard>
        );
      }
    }
  },
  getEvents: {
    description:
      'List funny imaginary events between user highlighted dates that describe stock activity.',
    parameters: z.object({
      events: z.array(
        z.object({
          date: z
            .string()
            .describe('The date of the event, in ISO-8601 format'),
          headline: z.string().describe('The headline of the event'),
          description: z.string().describe('The description of the event')
        })
      )
    }),
    generate: async function*({ events }: { events: any[] }) {
      yield (
        <BotCard>
          <div>Loading events...</div>
        </BotCard>
      );

      await sleep(1000);

      return (
        <BotCard>
          <Events props={events} />
        </BotCard>
      );
    }
  }
};
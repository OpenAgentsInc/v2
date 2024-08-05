import { z } from 'zod'
import { nanoid } from '@/lib/utils'
import { BotCard } from '@/components/stocks'
import { StocksSkeleton } from '@/components/stocks/stocks-skeleton'
import { Stocks } from '@/components/stocks/stocks'
import { sleep } from '@/lib/utils'

export const getTools = (aiState: any) => ({
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
        generate: async function*({ stocks }) {
            yield (
                <BotCard>
                    <StocksSkeleton />
                </BotCard>
            )

            await sleep(1000)

            const toolCallId = nanoid()

            aiState.done({
                ...aiState.get(),
                messages: [
                    ...aiState.get().messages,
                    {
                        id: nanoid(),
                        role: 'assistant',
                        content: [
                            {
                                type: 'tool-call',
                                toolName: 'listStocks',
                                toolCallId,
                                args: { stocks }
                            }
                        ]
                    },
                    {
                        id: nanoid(),
                        role: 'tool',
                        content: [
                            {
                                type: 'tool-result',
                                toolName: 'listStocks',
                                toolCallId,
                                result: stocks
                            }
                        ]
                    }
                ]
            })

            return (
                <BotCard>
                    <Stocks props={stocks} />
                </BotCard>
            )
        }
    },
    // Add other tools here as needed
})

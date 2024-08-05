import {
    getMutableAIState,
    streamUI,
    createStreamableValue,
    nanoid,
    BotMessage,
    SpinnerMessage,
    BotCard,
    FileViewer,
    z,
    openai
} from './imports'



export async function submitUserMessage(content: string) {
    'use server'

    const aiState = getMutableAIState<typeof AI>()

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
    })

    let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
    let textNode: undefined | React.ReactNode

    const result = await streamUI({
        // model: anthropic('claude-3-5-sonnet-20240620'),
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
                textStream = createStreamableValue('')
                textNode = <BotMessage content={textStream.value} />
            }

            if (done) {
                textStream.done()
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
                })
            } else {
                textStream.update(delta)
            }

            return textNode
        },
        tools: {
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
                generate: async function*({ symbol, price, delta }) {
                    yield (
                        <BotCard>
                            <StockSkeleton />
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
                                        toolName: 'showStockPrice',
                                        toolCallId,
                                        args: { symbol, price, delta }
                                    }
                                ]
                            },
                            {
                                id: nanoid(),
                                role: 'tool',
                                content: [
                                    {
                                        type: 'tool-result',
                                        toolName: 'showStockPrice',
                                        toolCallId,
                                        result: { symbol, price, delta }
                                    }
                                ]
                            }
                        ]
                    })

                    return (
                        <BotCard>
                            <Stock props={{ symbol, price, delta }} />
                        </BotCard>
                    )
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
                generate: async function*({ symbol, price, numberOfShares = 100 }) {
                    const toolCallId = nanoid()

                    if (numberOfShares <= 0 || numberOfShares > 1000) {
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
                                            toolName: 'showStockPurchase',
                                            toolCallId,
                                            args: { symbol, price, numberOfShares }
                                        }
                                    ]
                                },
                                {
                                    id: nanoid(),
                                    role: 'tool',
                                    content: [
                                        {
                                            type: 'tool-result',
                                            toolName: 'showStockPurchase',
                                            toolCallId,
                                            result: {
                                                symbol,
                                                price,
                                                numberOfShares,
                                                status: 'expired'
                                            }
                                        }
                                    ]
                                },
                                {
                                    id: nanoid(),
                                    role: 'system',
                                    content: `[User has selected an invalid amount]`
                                }
                            ]
                        })

                        return <BotMessage content={'Invalid amount'} />
                    } else {
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
                                            toolName: 'showStockPurchase',
                                            toolCallId,
                                            args: { symbol, price, numberOfShares }
                                        }
                                    ]
                                },
                                {
                                    id: nanoid(),
                                    role: 'tool',
                                    content: [
                                        {
                                            type: 'tool-result',
                                            toolName: 'showStockPurchase',
                                            toolCallId,
                                            result: {
                                                symbol,
                                                price,
                                                numberOfShares
                                            }
                                        }
                                    ]
                                }
                            ]
                        })

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
                        )
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
                generate: async function*({ events }) {
                    yield (
                        <BotCard>
                            <EventsSkeleton />
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
                                        toolName: 'getEvents',
                                        toolCallId,
                                        args: { events }
                                    }
                                ]
                            },
                            {
                                id: nanoid(),
                                role: 'tool',
                                content: [
                                    {
                                        type: 'tool-result',
                                        toolName: 'getEvents',
                                        toolCallId,
                                        result: events
                                    }
                                ]
                            }
                        ]
                    })

                    return (
                        <BotCard>
                            <Events props={events} />
                        </BotCard>
                    )
                }
            }
        }
    })

    return {
        id: nanoid(),
        display: result.value
    }
}


import 'server-only'

import {
    createAI,
    createStreamableUI,
    getMutableAIState,
    getAIState,
    streamUI,
    createStreamableValue
} from 'ai/rsc'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'

import {
    spinner,
    BotCard,
    BotMessage,
    SystemMessage,
    Stock,
    Purchase
} from '@/components/stocks'

import { z } from 'zod'
import { EventsSkeleton } from '@/components/stocks/events-skeleton'
import { Events } from '@/components/stocks/events'
import { StocksSkeleton } from '@/components/stocks/stocks-skeleton'
import { Stocks } from '@/components/stocks/stocks'
import { StockSkeleton } from '@/components/stocks/stock-skeleton'
import {
    formatNumber,
    runAsyncFnWithoutBlocking,
    sleep,
    nanoid
} from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import { Chat, Message } from '@/lib/types'
import { auth } from '@/auth'

import { viewFileContents } from '@/lib/github/actions/viewFile'
import { FileViewer } from '@/components/github/FileViewer'

export {
    createAI,
    createStreamableUI,
    getMutableAIState,
    getAIState,
    streamUI,
    createStreamableValue,
    openai,
    anthropic,
    spinner,
    BotCard,
    BotMessage,
    SystemMessage,
    Stock,
    Purchase,
    z,
    EventsSkeleton,
    Events,
    StocksSkeleton,
    Stocks,
    StockSkeleton,
    formatNumber,
    runAsyncFnWithoutBlocking,
    sleep,
    nanoid,
    saveChat,
    SpinnerMessage,
    UserMessage,
    Chat,
    Message,
    auth,
    viewFileContents,
    FileViewer
}
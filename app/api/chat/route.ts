import { StreamingTextResponse, LangChainStream, Message } from 'ai'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { AIMessage, HumanMessage } from 'langchain/schema'
import { onFinish } from './onFinish'
import { createNewThread } from '@/db/actions'
import { auth } from '@clerk/nextjs'

export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages, threadId, model } = await req.json()
  const { userId } = auth()

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { stream, handlers } = LangChainStream()

  const llm = new ChatOpenAI({
    modelName: model,
    streaming: true,
  })

  const newThreadId = threadId || (await createNewThread(userId)).threadId

  llm.call(
    messages.map((m: Message) => (m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content))),
    {},
    [handlers]
  ).catch(console.error)

  const userMessage = messages[messages.length - 1]

  handlers.handleChainEnd = (finishResult) => {
    const assistantMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: finishResult.generations[0][0].text,
    }
    onFinish({
      ...finishResult,
      threadId: newThreadId,
      clerkUserId: userId,
      userMessage,
      assistantMessage,
    })
  }

  return new StreamingTextResponse(stream)
}
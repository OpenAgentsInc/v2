# Chat implementation

[Previous content remains unchanged]

## Specific File Updates for Refactoring

To implement the suggested improvements for chat thread ID creation and management, the following files should be updated:

1. components/new-chat-button.tsx:
   - Remove the generation of temporary string IDs.
   - Implement an async function to create a new thread using the API before adding a new pane.
   - Update the addPane call to use the returned integer ID from the API.

   ```typescript
   import { useState } from 'react'
   import { useHudStore } from '@/store/hud'
   import { useChatStore } from '@/store/chat'
   import { buttonVariants } from '@/components/ui/button'
   import { IconPlus } from '@/components/ui/icons'
   import { cn } from '@/lib/utils'

   export function NewChatButton() {
       const { addPane } = useHudStore()
       const { setCurrentThreadId } = useChatStore()
       const [isCreating, setIsCreating] = useState(false)

       const handleNewChat = async () => {
           setIsCreating(true)
           try {
               const response = await fetch('/api/thread', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
               })
               if (!response.ok) throw new Error('Failed to create thread')
               const { threadId } = await response.json()
               setCurrentThreadId(threadId)
               addPane({
                   type: 'chat',
                   title: 'New Chat',
                   paneProps: {
                       x: 300,
                       y: 20,
                       width: 600,
                       height: 400,
                       id: threadId
                   }
               })
           } catch (error) {
               console.error('Error creating new chat:', error)
               // Implement user-facing error handling here
           } finally {
               setIsCreating(false)
           }
       }

       return (
           <button
               onClick={handleNewChat}
               disabled={isCreating}
               className={cn(
                   buttonVariants({ variant: 'outline' }),
                   'h-10 w-full justify-start bg-zinc-50 px-4 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10'
               )}
           >
               <IconPlus className="-translate-x-2 stroke-2" />
               {isCreating ? 'Creating...' : 'New Chat'}
           </button>
       )
   }
   ```

2. hooks/useChat.ts:
   - Update the ChatStore interface to use number type for thread IDs.
   - Modify the useChat hook to work with number IDs instead of strings.
   - Remove the use of useThreadCreation hook, as thread creation will be handled by the NewChatButton.

   ```typescript
   import { useCallback, useState } from 'react'
   import { create } from 'zustand'
   import { useChat as useVercelChat, Message } from 'ai/react'
   import { useModelStore } from '@/store/models'
   import { useRepoStore } from '@/store/repo'
   import { useToolStore } from '@/store/tools'

   interface ChatStore {
       currentThreadId: number | null
       threads: Record<number, ThreadData>
       setCurrentThreadId: (id: number) => void
       getThreadData: (id: number) => ThreadData
       setMessages: (id: number, messages: Message[]) => void
       setInput: (id: number, input: string) => void
   }

   const useChatStore = create<ChatStore>((set, get) => ({
       currentThreadId: null,
       threads: {},
       setCurrentThreadId: (id: number) => set({ currentThreadId: id }),
       getThreadData: (id: number) => {
           const { threads } = get()
           if (!threads[id]) {
               threads[id] = { id, messages: [], input: '' }
           }
           return threads[id]
       },
       setMessages: (id: number, messages: Message[]) =>
           set(state => ({
               threads: {
                   ...state.threads,
                   [id]: { ...state.threads[id], messages }
               }
           })),
       setInput: (id: number, input: string) =>
           set(state => ({
               threads: {
                   ...state.threads,
                   [id]: { ...state.threads[id], input }
               }
           })),
   }))

   interface UseChatProps {
       id?: number
   }

   export function useChat({ id: propsId }: UseChatProps = {}) {
       const model = useModelStore((state) => state.model)
       const repo = useRepoStore((state) => state.repo)
       const tools = useToolStore((state) => state.tools)

       const {
           currentThreadId,
           setCurrentThreadId,
           getThreadData,
           setMessages,
           setInput: setStoreInput
       } = useChatStore()

       const [threadId] = useState<number | undefined>(propsId || currentThreadId || undefined)

       if (!threadId) {
           throw new Error('No thread ID available')
       }

       const threadData = getThreadData(threadId)

       const body: any = { model, tools, threadId }
       if (repo) {
           body.repoOwner = repo.owner
           body.repoName = repo.name
           body.repoBranch = repo.branch
       }

       const vercelChatProps = useVercelChat({
           id: threadId.toString(),
           initialMessages: threadData.messages,
           body,
           onFinish: (message) => {
               const updatedMessages = [...threadData.messages, message]
               setMessages(threadId, updatedMessages)
           },
       })

       const sendMessage = useCallback(async (message: string) => {
           const userMessage: Message = { id: Date.now().toString(), content: message, role: 'user' }
           const updatedMessages = [...threadData.messages, userMessage]
           setMessages(threadId, updatedMessages)

           return vercelChatProps.append(userMessage)
       }, [threadId, vercelChatProps, threadData.messages, setMessages])

       const setInput = (input: string) => {
           setStoreInput(threadId, input)
           vercelChatProps.setInput(input)
       }

       return {
           ...vercelChatProps,
           id: threadId,
           threadData,
           setCurrentThreadId,
           setInput,
           sendMessage,
       }
   }
   ```

3. components/chat.tsx:
   - Update the ChatProps interface to use number type for the id prop.
   - Modify the component to handle cases where the id prop might be undefined.

   ```typescript
   export interface ChatProps extends React.ComponentProps<'div'> {
       id?: number
   }

   export const Chat = React.memo(function Chat({ className, id: propId }: ChatProps) {
       const {
           messages,
           input,
           id,
           handleInputChange,
           handleSubmit,
       } = useChat({ id: propId })

       // Rest of the component remains the same
   })
   ```

4. app/api/thread/route.ts:
   - Ensure this endpoint creates a new thread in the database and returns the integer ID.
   - Implement proper error handling and status codes.

   ```typescript
   import { NextResponse } from 'next/server'
   import { auth } from '@clerk/nextjs'
   import { db } from '@/lib/db'

   export async function POST() {
       try {
           const { userId } = auth()
           if (!userId) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
           }

           const result = await db.query(
               'INSERT INTO threads (user_id) VALUES ($1) RETURNING id',
               [userId]
           )

           const threadId = result.rows[0].id

           return NextResponse.json({ threadId }, { status: 201 })
       } catch (error) {
           console.error('Error creating thread:', error)
           return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
       }
   }
   ```

5. app/api/chat/route.ts:
   - Update to work with integer thread IDs instead of string IDs.
   - Implement proper error handling for cases where the thread ID is invalid or missing.

   ```typescript
   import { NextRequest, NextResponse } from 'next/server'
   import { Message as VercelChatMessage, StreamingTextResponse } from 'ai'
   import { ChatOpenAI } from 'langchain/chat_models/openai'
   import { BytesOutputParser } from 'langchain/schema/output_parser'
   import { PromptTemplate } from 'langchain/prompts'
   import { auth } from '@clerk/nextjs'
   import { db } from '@/lib/db'

   export const runtime = 'edge'

   export async function POST(req: NextRequest) {
       const { userId } = auth()
       if (!userId) {
           return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
       }

       const { messages, threadId } = await req.json()
       
       if (!threadId || isNaN(Number(threadId))) {
           return NextResponse.json({ error: 'Invalid thread ID' }, { status: 400 })
       }

       // Verify that the thread belongs to the user
       const threadResult = await db.query(
           'SELECT id FROM threads WHERE id = $1 AND user_id = $2',
           [threadId, userId]
       )

       if (threadResult.rows.length === 0) {
           return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
       }

       // Rest of the chat logic remains the same
   }
   ```

6. types/index.ts:
   - Update any relevant type definitions to use number for thread IDs.

   ```typescript
   export interface Thread {
       id: number
       userId: string
       createdAt: Date
       updatedAt: Date
   }

   export interface Message {
       id: number
       threadId: number
       content: string
       role: 'user' | 'assistant'
       createdAt: Date
   }
   ```

7. store/chat.ts:
   - Update the chat store to use number type for thread IDs.

   ```typescript
   import { create } from 'zustand'
   import { Message } from '@/types'

   interface ChatState {
       currentThreadId: number | null
       threads: Record<number, {
           messages: Message[]
           input: string
       }>
       setCurrentThreadId: (id: number) => void
       addMessage: (threadId: number, message: Message) => void
       setInput: (threadId: number, input: string) => void
   }

   export const useChatStore = create<ChatState>((set) => ({
       currentThreadId: null,
       threads: {},
       setCurrentThreadId: (id) => set({ currentThreadId: id }),
       addMessage: (threadId, message) => set((state) => ({
           threads: {
               ...state.threads,
               [threadId]: {
                   ...state.threads[threadId],
                   messages: [...(state.threads[threadId]?.messages || []), message],
               },
           },
       })),
       setInput: (threadId, input) => set((state) => ({
           threads: {
               ...state.threads,
               [threadId]: {
                   ...state.threads[threadId],
                   input,
               },
           },
       })),
   }))
   ```

These updates will address the issues with temporary string IDs, ensure type consistency, improve error handling, and streamline the thread creation process. Remember to update any other components or utilities that interact with thread IDs to use the number type and handle potential undefined values appropriately.

After implementing these changes, thoroughly test the application to ensure that all chat functionality works as expected with the new integer-based thread ID system.
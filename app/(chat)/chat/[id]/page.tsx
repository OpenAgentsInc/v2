"use server"

import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Chat } from '@/components/chat'

export interface ChatPageProps {
    params: {
        id: string
    }
}

export async function generateMetadata({
    params
}: ChatPageProps): Promise<Metadata> {
    const session = auth()

    if (!session?.userId) {
        return {}
    }

    // TODO: Implement getChat using Postgres
    const chat = { title: 'Chat' }

    return {
        title: chat?.title.toString().slice(0, 50) ?? 'Chat'
    }
}

export default async function ChatPage({ params }: ChatPageProps) {
    const session = auth()

    if (!session?.userId) {
        console.log("Skipping unauthed redirect...")
        // redirect(`/login?next=/chat/${params.id}`)
    }

    const userId = session.userId as string
    
    // TODO: Implement getChat using Postgres
    const chat = { id: params.id, userId: session.userId, messages: [] }

    if (chat?.userId !== session?.userId) {
        console.log("Not found.")
        notFound()
    }

    return (
        <Chat
            id={chat.id}
            user={{ id: userId }}
            initialMessages={chat.messages}
        />
    )
}
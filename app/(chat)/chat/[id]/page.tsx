"use server"

import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getChat } from '@/app/actions'
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

    const chat = await getChat(params.id, session.userId)

    if (!chat || 'error' in chat) {
        console.log("Metadata error redirecting...")
        redirect('/')
    } else {
        return {
            title: chat?.title.toString().slice(0, 50) ?? 'Chat'
        }
    }
}

export default async function ChatPage({ params }: ChatPageProps) {
    const session = auth()

    if (!session?.userId) {
        console.log("Skipping unauthed redirect...")
        // redirect(`/login?next=/chat/${params.id}`)
    }

    const userId = session.userId as string
    const chat = await getChat(params.id, userId)

    if (!chat || 'error' in chat) {
        // console.log("Skipping redirect in page.")
        console.log("Chat not found, redirecting...")
        redirect('/')
    } else {
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
}

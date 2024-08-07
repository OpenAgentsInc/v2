"use server"

import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { currentUser, User } from '@clerk/nextjs/server';

export async function generateMetadata() {
    return {
        title: 'Chat',
    }
}

export default async function IndexPage() {
    const id = nanoid()
    const user: User | null = await currentUser();
    const userOrNah = user ? { id: user.id } : undefined

    return (
        <Chat id={id} user={userOrNah} />
    )
}

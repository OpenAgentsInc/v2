"use server"

import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { getMissingKeys } from '@/app/actions'
import { currentUser, User } from '@clerk/nextjs/server';

export async function generateMetadata() {
    return {
        title: 'Chat',
    }
}

export default async function IndexPage() {
    const id = nanoid()
    const missingKeys = await getMissingKeys()
    const user: User | null = await currentUser();
    console.log("current user", user)
    const userOrNah = user ? { id: user.id } : { id: 'anon' }

    return (
        <AI initialAIState={{ chatId: id, messages: [] }}>
            <Chat id={id} user={userOrNah} missingKeys={missingKeys} />
        </AI>
    )
}

import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { getMissingKeys } from '@/app/actions'
import { currentUser, User } from '@clerk/nextjs/server';

export const metadata = {
    title: 'Chat',
}

export default async function IndexPage() {
    const id = nanoid()
    const missingKeys = await getMissingKeys()
    const user: User | null = await currentUser();
    const userOrNah = user ? user : { id: 'anon' }

    return (
        <AI initialAIState={{ chatId: id, messages: [] }}>
            <Chat id={id} user={userOrNah} missingKeys={missingKeys} />
        </AI>
    )
}

import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
// import { auth } from '@/auth'
// import { Session } from '@/lib/types'
import { getMissingKeys } from '@/app/actions'
import { currentUser, User } from '@clerk/nextjs/server';

export const metadata = {
    title: 'Chat',
}

export default async function IndexPage() {
    const id = nanoid()
    // const session = (await auth()) as Session
    const missingKeys = await getMissingKeys()
    const session = {}
    const user: User | null = await currentUser();

    console.log(user)
    return (
        <AI initialAIState={{ chatId: id, messages: [] }}>
            <Chat id={id} user={{ id: 'testo' }} missingKeys={missingKeys} />
        </AI>
    )
}

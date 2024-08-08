'use server'

import { saveMessage, createChat, getChatMessages, updateChat } from '@/lib/db/queries'
import { Message, Chat } from '@/lib/types'

export async function saveChatMessage(chatId: string, message: any) {
    if (chatId) {
        await saveMessage(chatId, message)
    }
}

export async function createNewChat(userId: string, chat: Chat) {
    return await createChat(userId, chat)
}

export async function fetchChatMessages(chatId: string) {
    return await getChatMessages(chatId)
}

export async function updateChatData(chatId: string, data: Partial<Chat>) {
    await updateChat(chatId, data)
}

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
// import { kv } from '@vercel/kv'

import { auth } from '@clerk/nextjs/server'
import { type Chat } from '@/lib/types'

export async function getChats(userId?: string | null) {
    // TODO: Implement getChats using Postgres
    throw new Error('Not implemented: getChats')
}

export async function getChat(id: string, userId: string) {
    // TODO: Implement getChat using Postgres
    throw new Error('Not implemented: getChat')
}

export async function removeChat({ id, path }: { id: string; path: string }) {
    // TODO: Implement removeChat using Postgres
    throw new Error('Not implemented: removeChat')
}

export async function clearChats() {
    // TODO: Implement clearChats using Postgres
    throw new Error('Not implemented: clearChats')
}

export async function getSharedChat(id: string) {
    // TODO: Implement getSharedChat using Postgres
    throw new Error('Not implemented: getSharedChat')
}

export async function shareChat(id: string) {
    // TODO: Implement shareChat using Postgres
    throw new Error('Not implemented: shareChat')
}

export async function saveChat(chat: Chat) {
    // TODO: Implement saveChat using Postgres
    throw new Error('Not implemented: saveChat')
}

export async function refreshHistory(path: string) {
    redirect(path)
}

export async function getMissingKeys() {
    const keysRequired = ['OPENAI_API_KEY']
    return keysRequired
        .map(key => (process.env[key] ? '' : key))
        .filter(key => key !== '')
}
import { CoreMessage } from 'ai'
import { models } from "@/lib/models"

export type Message = CoreMessage & {
    id: string
    toolInvocations?: any[]
}

export type ServerMessage = Message & {
    role: 'system' | 'assistant' | 'function'
}

export type ClientMessage = Message & {
    role: 'user'
}

export interface Chat extends Record<string, any> {
    id: string
    title: string
    createdAt: Date
    userId: string
    path: string
    messages: Message[]
    sharePath?: string
}

export type ServerActionResult<T> = Promise<
    | { success: true; data: T }
    | { success: false; error: string }
>

export interface Session {
    user: {
        id: string
        email: string
    }
}

export interface AuthResult {
    type: string
    message: string
}

export interface OldUser extends Record<string, any> {
    id: string
    email: string
    password: string
    salt: string
}

export interface User {
    id: string
}

export interface Model {
    id: string
    name: string
    provider: string
}

export interface Repo {
    id?: string
    name: string
    owner: string
    branch: string
}

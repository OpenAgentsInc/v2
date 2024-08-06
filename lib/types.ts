import { CoreMessage } from 'ai'

export type Message = CoreMessage & {
    id: string
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

export type ServerActionResult<r> = Promise<
    | Result
    | {
        error: string
    }
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

export interface Repo {
    id: string
    name: string
    owner: string
    branch: string
}
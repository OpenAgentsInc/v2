import { Message } from './message'

export interface Chat extends Record<string, any> {
    id: number
    title: string
    createdAt: Date
    userId: string
    path: string
    messages: Message[]
}

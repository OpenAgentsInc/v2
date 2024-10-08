import { Message } from './message'
import { Id } from '@/convex/_generated/dataModel'

export interface Chat extends Record<string, any> {
    id: Id<'threads'>
    title: string
    createdAt: Date
    userId: Id<'users'>
    path: string
    messages: Message[]
}
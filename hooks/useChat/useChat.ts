/**
 * @file hooks/useChat/useChat.ts
 * @description Chat hook. Import as { useChat } from "@/hooks/useChat"
 */

import { useState } from 'react'
import { Message } from '@/types'

export function useChat() {
    const [messages, setMessages] = useState<Message[]>([])
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {

    }
    return {
        handleSubmit,
        messages,
    }
}

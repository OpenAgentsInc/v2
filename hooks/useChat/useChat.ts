/**
 * @file hooks/useChat/useChat.ts
 * @description Chat hook. Import as { useChat } from "@/hooks/useChat"
 */
import { useState, useCallback, useMemo } from 'react'
import { Message, UseChatProps } from './types'
import { nanoid } from 'lib/utils'

type MessageMap = Map<string, Message[]>

export function useChat({ id: propId }: UseChatProps = {}) {
    const [messageMap, setMessageMap] = useState<MessageMap>(new Map())
    const [input, setInput] = useState<string>("")

    // Generate a random ID if not provided
    const id = useMemo(() => propId || nanoid(), [propId])

    const messages = messageMap.get(id) || []

    const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setInput("")
        const newMessage: Message = {
            id: nanoid(),
            content: input,
            createdAt: new Date(),
        }
        setMessageMap(prevMap => {
            const newMap = new Map(prevMap)
            const conversationMessages = newMap.get(id) || []
            newMap.set(id, [...conversationMessages, newMessage])
            return newMap
        })
    }, [id, input])

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
    }, [])

    return {
        id,
        input,
        handleInputChange,
        handleSubmit,
        messages,
    }
}

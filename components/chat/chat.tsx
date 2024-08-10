"use client"
import { useChat } from '@/hooks/useChat'
import { ChatList } from './chat-list'
import { EmptyScreen } from './empty-screen'
import { useEffect, useRef } from 'react'
import { useHudStore } from '@/store/hud'
import { InputBar } from '@/components/input/InputBar'  // Make sure this import is correct

export interface ChatProps extends React.ComponentProps<'div'> {
    chatId?: string | number
}

export const Chat = ({ chatId: propId, className }: ChatProps) => {
    const chatContainerRef = useRef<HTMLDivElement>(null)
    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        id,
        setCurrentThreadId,
        sendMessage
    } = useChat({ id: typeof propId === 'string' ? parseInt(propId, 10) : propId }) // remove?

    // remove?
    useEffect(() => {
        if (id) {
            setCurrentThreadId(id)
        }
    }, [id, setCurrentThreadId])

    useEffect(() => {
        if (propId) {
            useHudStore.setState((state) => ({
                panes: state.panes.map((pane) =>
                    pane.id === propId.toString() ? { ...pane, title: 'Chat' } : pane
                )
            }))
        }
    }, [propId])

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <div className="flex-1 overflow-auto" ref={chatContainerRef}>
                {messages.length ? (
                    <ChatList messages={messages} isShared={false} />
                ) : (
                    <></>
                )}
            </div>
            <div className="flex-shrink-0 w-full">
                <div className="sticky bottom-0 w-full">
                    <InputBar
                        input={input}
                        onInputChange={handleInputChange}
                        onSubmit={sendMessage}
                    />
                </div>
            </div>
        </div>
    )
}

import { useChat } from '@/hooks/useChat'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useEffect, useRef } from 'react'
import { useHudStore } from '@/store/hud'
import { Message } from '@/lib/types'

export interface ChatProps extends React.ComponentProps<'div'> {
  id?: number
}

export const Chat = ({ id: propId, className }: ChatProps) => {
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const { removePane } = useHudStore()

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    id,
    setCurrentThreadId
  } = useChat({ id: propId })

  useEffect(() => {
    if (id) {
      setCurrentThreadId(id)
    }
  }, [id, setCurrentThreadId])

  useEffect(() => {
    if (propId) {
      useHudStore.setState((state) => ({
        panes: state.panes.map((pane) =>
          pane.id === propId ? { ...pane, title: 'Chat' } : pane
        )
      }))
    }
  }, [propId])

  return (
    <>
      <div className={`flex-1 overflow-hidden ${className}`} ref={chatContainerRef}>
        {messages.length ? (
          <ChatList messages={messages} isShared={false} />
        ) : (
          <EmptyScreen />
        )}
      </div>
      <ChatPanel
        id={id}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
      />
    </>
  )
}
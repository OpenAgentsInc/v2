import React from 'react'
import { Pane } from '../hud/pane'
import { ChatHistory } from '../chat/ChatHistory'
import { UserStatus } from '../hud/UserStatus'
import { ChatInput } from '../chat/ChatInput'
import { ChatPane } from '../chat/ChatPane'
import { useThreadManagement } from '@/hooks/useThreadManagement'

export function HomeAuthed() {
  const { threadId } = useThreadManagement()

  return (
    <div className="relative w-full h-full">
      <UserStatus />
      <ChatInput />
      <Pane title="Chat History" id="chat-history" x={20} y={190} height={350} width={260} dismissable={false}>
        <ChatHistory />
      </Pane>
      {threadId && (
        <ChatPane threadId={threadId} />
      )}
    </div>
  )
}
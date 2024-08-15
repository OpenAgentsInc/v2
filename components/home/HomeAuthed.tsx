import React from 'react'
import { Pane } from '../hud/pane'
import { UserStatus } from '../hud/UserStatus'
import { useThreadManagement } from '@/hooks/useThreadManagement'
import { Chat } from '../chat/chat'

export function HomeAuthed() {
  const { threadId } = useThreadManagement()

  return (
    <div className="relative w-full h-full">
      <UserStatus />
      <Pane title="Chat History" id="chat-history" x={20} y={190} height={350} width={260} dismissable={false}>
        {/* TODO: Implement ChatHistory component */}
      </Pane>
      {threadId && (
        <Chat threadId={threadId} />
      )}
    </div>
  )
}
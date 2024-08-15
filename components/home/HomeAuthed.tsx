import React from 'react'
import { Pane } from '@/components/hud/pane'
import { UserStatus } from '@/components/hud/UserStatus'
import { ChatHistory } from '@/components/sidebar/chat-history'
import { useUser } from '@clerk/nextjs'

export function HomeAuthed() {
  const { user } = useUser()
  if (!user) return null

  return (
    <div className="relative w-full h-full">
      <UserStatus />
      <Pane title="Chat History" id="chat-history" type="default" x={20} y={190} height={350} width={260} dismissable={false}>
        <ChatHistory clerkUserId={user.id} />
      </Pane>
    </div>
  )
}

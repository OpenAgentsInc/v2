"use client"

import { Hud } from '@/components/hud/hud'
import { Pane } from '@/components/hud/pane'
import { ChatHistory } from '@/components/sidebar/chat-history'
import { useAuth } from "@clerk/nextjs"
import { Knowledge } from '../knowledge/Knowledge'

export const HomeAuthed = () => {
  const { userId } = useAuth()
  if (!userId) {
    return <></>
  }
  return (
    <main className="h-screen flex items-center justify-center relative">
      <Pane title="Chat History" id={0} x={90} y={190} height={350} width={260} dismissable={false}>
        <ChatHistory userId={userId} />
      </Pane>
      <Pane title="Knowledge" id={-1} x={90} y={590} height={150} width={260} dismissable={false}>
        <Knowledge />
      </Pane>
      <Hud />
    </main>
  )
}

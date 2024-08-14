"use client"

import { Hud } from '@/components/hud/hud'
import { Pane } from '@/components/hud/pane'
import { ChatHistory } from '@/components/sidebar/chat-history'
import { useAuth } from "@clerk/nextjs"

export const HomeAuthed = () => {
  const { userId } = useAuth()
  if (!userId) {
    return <></>
  }
  return (
    <main className="h-screen flex items-center justify-center relative">
      <Pane title="Chat History" id={0} x={90} y={190} height={450} width={260} dismissable={false}>
        <ChatHistory userId={userId} />
      </Pane>
      <Hud />
    </main>
  )
}

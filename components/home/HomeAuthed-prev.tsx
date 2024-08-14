"use server"

// import { auth } from '@clerk/nextjs/server'
import { Hud } from '@/components/hud/hud'
import { Pane } from '@/components/hud/pane'
import { ChatHistory } from '@/components/sidebar/chat-history'

export const HomeAuthed = async () => {
  // const userId = auth().userId
  // if (!userId) {
  //     return <></>
  // }
  const userId = 'yo'
  return (
    <main className="h-screen flex items-center justify-center relative">
    </main>
  )
}

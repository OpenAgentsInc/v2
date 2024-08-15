import React from 'react'
import { Pane } from '@/panes/Pane'
import { ChatHistory } from '@/components/sidebar/chat-history'
import { useUser } from '@clerk/nextjs'
import { PaneManager } from '@/panes/PaneManager'
import { usePaneStore } from '@/store/pane'

export function HomeAuthed() {
  const { user } = useUser()
  const addPane = usePaneStore(state => state.addPane)

  if (!user) return null

  React.useEffect(() => {
    addPane({
      id: 'chat-history',
      title: 'Chat History',
      type: 'default',
      x: 20,
      y: 190,
      height: 350,
      width: 260,
      dismissable: false,
      content: <ChatHistory clerkUserId={user.id} />
    })
  }, [user.id, addPane])

  return (
    <div className="relative w-full h-full">
      <PaneManager />
    </div>
  )
}
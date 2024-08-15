"use client"

import { useHudStore } from '@/store/hud'
import { Chat } from '@/components/chat'
import { Pane as PaneComponent } from '@/panes/Pane'
import { UserStatus } from '@/panes/user/UserStatus'
import { Id } from '@/convex/_generated/dataModel'
import { Pane } from '@/types/pane'

export const Hud = () => {
  const { panes } = useHudStore()

  const stripChatPrefix = (id: string): string => {
    // Remove 'chat-' prefix up to two times
    let strippedId = id.replace(/^chat-/, '').replace(/^chat-/, '')
    return strippedId
  }

  return (
    <div>
      <UserStatus />
      {panes.map((pane: Pane) => (
        <PaneComponent
          key={pane.id}
          title={pane.title}
          id={stripChatPrefix(pane.id)}
          x={pane.x}
          y={pane.y}
          height={pane.height}
          width={pane.width}
          type={pane.type}
          content={pane.content}
          isActive={pane.isActive}
        >
          {pane.type === 'chat' && <Chat threadId={stripChatPrefix(pane.id) as Id<"threads">} />}
          {pane.type === 'diff' && pane.content && (
            <div>
              <h3>Old Content:</h3>
              <pre>{pane.content.oldContent}</pre>
              <h3>New Content:</h3>
              <pre>{pane.content.newContent}</pre>
            </div>
          )}
        </PaneComponent>
      ))}
    </div>
  )
}
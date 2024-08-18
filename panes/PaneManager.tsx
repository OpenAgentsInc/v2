"use client"

import { usePaneStore } from '@/store/pane'
import { Chat, Pane as PaneComponent, UserStatus, ChatsPane, ChangelogPane } from '@/panes'
import { Pane } from '@/types/pane'
import { Id } from '@/convex/_generated/dataModel'

export const PaneManager = () => {
  const { panes } = usePaneStore()

  const stripChatPrefix = (id: string): string => {
    // Remove 'chat-' prefix up to two times
    return id.replace(/^chat-/, '').replace(/^chat-/, '')
  }

  // Ensure Chats pane is always first, followed by Changelog
  const sortedPanes = [...panes].sort((a, b) => {
    if (a.type === 'chats') return -1
    if (b.type === 'chats') return 1
    if (a.type === 'changelog') return -1
    if (b.type === 'changelog') return 1
    return 0
  })

  return (
    <>
      <UserStatus />
      {sortedPanes.map((pane: Pane) => (
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
          dismissable={pane.type !== 'chats'} // Chats pane cannot be dismissed
        >
          {pane.type === 'chat' && <Chat threadId={stripChatPrefix(pane.id) as Id<"threads">} />}
          {pane.type === 'chats' && <ChatsPane />}
          {pane.type === 'changelog' && <ChangelogPane />}
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
    </>
  )
}
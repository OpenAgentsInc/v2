import { useHudStore } from '@/store/hud'
import { Chat } from '@/components/chat'

export const Hud = () => {
  const { panes } = useHudStore()

  return (
    <div>
      {panes.map((pane) => (
        <div key={pane.id}>
          {pane.type === 'chat' && <Chat id={typeof pane.id === 'string' ? parseInt(pane.id, 10) : pane.id} />}
        </div>
      ))}
    </div>
  )
}

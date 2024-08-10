"use client"

import { useHudStore } from '@/store/hud'
import { Chat } from '@/components/chat'
import { Pane } from '@/components/hud/pane'

export const Hud = () => {
    const { panes } = useHudStore()
    console.log("All panes:", panes)

    return (
        <div>
            {panes.map((pane) => {
                console.log("Rendering pane:", pane)
                return (
                    <Pane
                        key={pane.id}
                        title={pane.title}
                        id={pane.id}
                        x={pane.x}
                        y={pane.y}
                        height={pane.height}
                        width={pane.width}
                    >
                        {pane.type === 'chat' && (
                            <Chat threadId={pane.content?.id ?? pane.id} />
                        )}
                    </Pane>
                )
            })}
        </div>
    )
}

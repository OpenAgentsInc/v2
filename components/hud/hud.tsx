"use client"

import { useHudStore } from '@/store/hud'
import { Chat } from '@/components/chat'
import { Pane } from '@/components/hud/pane'
import { UserStatus } from './UserStatus'

export const Hud = () => {
    const { panes } = useHudStore()

    return (
        <div>
            <UserStatus />
            {panes.map((pane) => (
                <Pane
                    key={pane.id}
                    title={pane.title}
                    id={pane.id}
                    x={pane.x}
                    y={pane.y}
                    height={pane.height}
                    width={pane.width}
                >
                    {pane.type === 'chat' && <Chat threadId={pane.id} />}
                </Pane>
            ))}
        </div>
    )
}

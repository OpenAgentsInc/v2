"use client"

import { useHudStore } from '@/store/hud'
import { Pane } from '@/components/hud/pane'
import { Chat } from '@/components/chat'
import { SingleMountWrapper } from '@/components/single-mount-wrapper'

export const HUD = () => {
    const { panes } = useHudStore()

    return (
        <>
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
                    <SingleMountWrapper>
                        {pane.type === 'chat' && <Chat id={pane.id} />}
                    </SingleMountWrapper>
                </Pane>
            ))}
        </>
    )
}

"use client"

import React, { useState, useEffect } from 'react'
import { useDrag } from '@use-gesture/react'
import { useHudStore } from "@/store/hud"

interface PaneProps {
    id: string
    title: string
    x: number
    y: number
    width: number
    height: number
    children?: React.ReactNode
    titleBarButtons?: React.ReactNode
}

export const Pane: React.FC<PaneProps> = ({ id, title, x: initialX, y: initialY, width: initialWidth, height: initialHeight, children, titleBarButtons }) => {
    const [position, setPosition] = useState({ x: initialX, y: initialY })
    const [size, setSize] = useState({ width: initialWidth, height: initialHeight })
    const [bounds, setBounds] = useState({ right: 0, bottom: 0 })
    const updatePanePosition = useHudStore(state => state.updatePanePosition)
    const updatePaneSize = useHudStore(state => state.updatePaneSize)

    useEffect(() => {
        const updateBounds = () => {
            setBounds({
                right: window.innerWidth - size.width,
                bottom: window.innerHeight - size.height,
            })
        }

        updateBounds()
        window.addEventListener('resize', updateBounds)
        return () => window.removeEventListener('resize', updateBounds)
    }, [size.width, size.height])

    const bindDrag = useDrag(({ offset: [ox, oy] }) => {
        setPosition({ x: ox, y: oy })
        updatePanePosition(id, ox, oy)
    }, {
        from: () => [position.x, position.y],
        bounds: {
            left: 0,
            top: 0,
            right: bounds.right,
            bottom: bounds.bottom,
        },
    })

    const bindResize = (direction: string) =>
        useDrag(
            ({ movement: [deltaX, deltaY], first, memo }) => {
                if (first) {
                    memo = { ...position, ...size }
                }

                let newX = memo.x
                let newY = memo.y
                let newWidth = memo.width
                let newHeight = memo.height

                if (direction.includes("left")) {
                    newX = Math.min(memo.x + deltaX, memo.x + memo.width - 200)
                    newWidth = Math.max(200, memo.width - deltaX)
                } else if (direction.includes("right")) {
                    newWidth = Math.max(200, memo.width + deltaX)
                }

                if (direction.includes("top")) {
                    newY = Math.min(memo.y + deltaY, memo.y + memo.height - 100)
                    newHeight = Math.max(100, memo.height - deltaY)
                } else if (direction.includes("bottom")) {
                    newHeight = Math.max(100, memo.height + deltaY)
                }

                setPosition({ x: newX, y: newY })
                setSize({ width: newWidth, height: newHeight })
                updatePanePosition(id, newX, newY)
                updatePaneSize(id, newWidth, newHeight)

                return memo
            },
            { memo: null }
        )

    return (
        <div
            style={{
                left: position.x,
                top: position.y,
                width: size.width,
                height: size.height,
            }}
            className="pointer-events-auto z-[9999] absolute bg-black bg-opacity-90 border border-white rounded-lg overflow-hidden shadow-lg transition-colors duration-200"
        >
            <div
                {...bindDrag()}
                className="select-none touch-none bg-black text-white border-b border-white font-bold py-2 px-4 cursor-move flex justify-between items-center"
            >
                <span className="text-sm">{title}</span>
                <div className="flex items-center">
                    {titleBarButtons}
                </div>
            </div>
            <div className="text-white h-[calc(100%-2.5rem)] overflow-auto">
                {children}
            </div>
            <div className="absolute inset-0 pointer-events-none border border-white rounded-lg opacity-50"></div>
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] rounded-lg"></div>
            <div {...bindResize("topleft")()} className="absolute -top-1 -left-1 w-4 h-4 cursor-nwse-resize" />
            <div {...bindResize("top")()} className="absolute -top-1 left-3 right-3 h-4 cursor-ns-resize" />
            <div {...bindResize("topright")()} className="absolute -top-1 -right-1 w-4 h-4 cursor-nesw-resize" />
            <div {...bindResize("right")()} className="absolute top-3 -right-1 w-4 bottom-3 cursor-ew-resize" />
            <div {...bindResize("bottomright")()} className="absolute -bottom-1 -right-1 w-4 h-4 cursor-se-resize" />
            <div {...bindResize("bottom")()} className="absolute -bottom-1 left-3 right-3 h-4 cursor-ns-resize" />
            <div {...bindResize("bottomleft")()} className="absolute -bottom-1 -left-1 w-4 h-4 cursor-nesw-resize" />
            <div {...bindResize("left")()} className="absolute top-3 -left-1 w-4 bottom-3 cursor-ew-resize" />
        </div>
    )
}

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

const useResizeHandlers = (
    id: string,
    initialPosition: { x: number; y: number },
    initialSize: { width: number; height: number },
    updatePanePosition: (id: string, x: number, y: number) => void,
    updatePaneSize: (id: string, width: number, height: number) => void
) => {
    const [position, setPosition] = useState(initialPosition)
    const [size, setSize] = useState(initialSize)

    const resizeHandlers = {
        topleft: useDrag(({ movement: [deltaX, deltaY], memo }) => {
            if (!memo) memo = { ...position, ...size }
            const newX = Math.min(memo.x + deltaX, memo.x + memo.width - 200)
            const newY = Math.min(memo.y + deltaY, memo.y + memo.height - 100)
            const newWidth = Math.max(200, memo.width - deltaX)
            const newHeight = Math.max(100, memo.height - deltaY)
            setPosition({ x: newX, y: newY })
            setSize({ width: newWidth, height: newHeight })
            updatePanePosition(id, newX, newY)
            updatePaneSize(id, newWidth, newHeight)
            return memo
        }, { memo: null }),
        top: useDrag(({ movement: [, deltaY], memo }) => {
            if (!memo) memo = { ...position, ...size }
            const newY = Math.min(memo.y + deltaY, memo.y + memo.height - 100)
            const newHeight = Math.max(100, memo.height - deltaY)
            setPosition({ ...position, y: newY })
            setSize({ ...size, height: newHeight })
            updatePanePosition(id, position.x, newY)
            updatePaneSize(id, size.width, newHeight)
            return memo
        }, { memo: null }),
        topright: useDrag(({ movement: [deltaX, deltaY], memo }) => {
            if (!memo) memo = { ...position, ...size }
            const newY = Math.min(memo.y + deltaY, memo.y + memo.height - 100)
            const newWidth = Math.max(200, memo.width + deltaX)
            const newHeight = Math.max(100, memo.height - deltaY)
            setPosition({ ...position, y: newY })
            setSize({ width: newWidth, height: newHeight })
            updatePanePosition(id, position.x, newY)
            updatePaneSize(id, newWidth, newHeight)
            return memo
        }, { memo: null }),
        right: useDrag(({ movement: [deltaX], memo }) => {
            if (!memo) memo = { ...size }
            const newWidth = Math.max(200, memo.width + deltaX)
            setSize({ ...size, width: newWidth })
            updatePaneSize(id, newWidth, size.height)
            return memo
        }, { memo: null }),
        bottomright: useDrag(({ movement: [deltaX, deltaY], memo }) => {
            if (!memo) memo = { ...size }
            const newWidth = Math.max(200, memo.width + deltaX)
            const newHeight = Math.max(100, memo.height + deltaY)
            setSize({ width: newWidth, height: newHeight })
            updatePaneSize(id, newWidth, newHeight)
            return memo
        }, { memo: null }),
        bottom: useDrag(({ movement: [, deltaY], memo }) => {
            if (!memo) memo = { ...size }
            const newHeight = Math.max(100, memo.height + deltaY)
            setSize({ ...size, height: newHeight })
            updatePaneSize(id, size.width, newHeight)
            return memo
        }, { memo: null }),
        bottomleft: useDrag(({ movement: [deltaX, deltaY], memo }) => {
            if (!memo) memo = { ...position, ...size }
            const newX = Math.min(memo.x + deltaX, memo.x + memo.width - 200)
            const newWidth = Math.max(200, memo.width - deltaX)
            const newHeight = Math.max(100, memo.height + deltaY)
            setPosition({ ...position, x: newX })
            setSize({ width: newWidth, height: newHeight })
            updatePanePosition(id, newX, position.y)
            updatePaneSize(id, newWidth, newHeight)
            return memo
        }, { memo: null }),
        left: useDrag(({ movement: [deltaX], memo }) => {
            if (!memo) memo = { ...position, ...size }
            const newX = Math.min(memo.x + deltaX, memo.x + memo.width - 200)
            const newWidth = Math.max(200, memo.width - deltaX)
            setPosition({ ...position, x: newX })
            setSize({ ...size, width: newWidth })
            updatePanePosition(id, newX, position.y)
            updatePaneSize(id, newWidth, size.height)
            return memo
        }, { memo: null }),
    }

    return { position, size, setPosition, setSize, resizeHandlers }
}

export const Pane: React.FC<PaneProps> = ({ id, title, x: initialX, y: initialY, width: initialWidth, height: initialHeight, children, titleBarButtons }) => {
    const [bounds, setBounds] = useState({ right: 0, bottom: 0 })
    const updatePanePosition = useHudStore(state => state.updatePanePosition)
    const updatePaneSize = useHudStore(state => state.updatePaneSize)

    const { position, size, setPosition, setSize, resizeHandlers } = useResizeHandlers(
        id,
        { x: initialX, y: initialY },
        { width: initialWidth, height: initialHeight },
        updatePanePosition,
        updatePaneSize
    )

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

    return (
        <div
            style={{
                left: position.x,
                top: position.y,
                width: size.width,
                height: size.height,
            }}
            className="pointer-events-auto z-[9999] absolute bg-black/90 border border-white rounded-lg overflow-hidden shadow-lg transition-colors duration-200"
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
            <div {...resizeHandlers.topleft()} className="absolute -top-1 -left-1 w-4 h-4 cursor-nwse-resize" />
            <div {...resizeHandlers.top()} className="absolute -top-1 left-3 right-3 h-4 cursor-ns-resize" />
            <div {...resizeHandlers.topright()} className="absolute -top-1 -right-1 w-4 h-4 cursor-nesw-resize" />
            <div {...resizeHandlers.right()} className="absolute top-3 -right-1 w-4 bottom-3 cursor-ew-resize" />
            <div {...resizeHandlers.bottomright()} className="absolute -bottom-1 -right-1 w-4 h-4 cursor-se-resize" />
            <div {...resizeHandlers.bottom()} className="absolute -bottom-1 left-3 right-3 h-4 cursor-ns-resize" />
            <div {...resizeHandlers.bottomleft()} className="absolute -bottom-1 -left-1 w-4 h-4 cursor-nesw-resize" />
            <div {...resizeHandlers.left()} className="absolute top-3 -left-1 w-4 bottom-3 cursor-ew-resize" />
        </div>
    )
}

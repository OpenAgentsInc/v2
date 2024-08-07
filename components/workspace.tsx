'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface WorkspaceProps extends React.ComponentProps<'div'> {
    // Add any specific props you need for the Workspace component
}

export function Workspace({ className }: WorkspaceProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div
            data-workspace-open={isOpen}
            className={cn(
                "flex flex-col h-full bg-white dark:bg-black",
                "transition-[width] duration-300 ease-in-out",
                "w-0 data-[workspace-open=true]:w-2/5",
                className
            )}
        >
            {/* Add your Workspace content here */}
            <div>Workspace Content</div>
            <button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? 'Close' : 'Open'} Workspace
            </button>
        </div>
    )
}

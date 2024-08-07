'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface WorkspaceProps extends React.ComponentProps<'div'> {
    // Add any specific props you need for the Workspace component
}

export function Workspace({ className }: WorkspaceProps) {
    return (
        <div
            className={cn(
                "flex flex-col h-full bg-white dark:bg-black border-white border",
                "transition-[width] duration-300 ease-in-out",
                "w-0 data-[state=open]:w-2/5",
                className
            )}
        >
            {/* Add your Workspace content here */}
            <div>Workspace Content</div>
        </div>
    )
}

'use client'

import React from 'react'
import { useSidebarStore } from '@/store/sidebar'

interface LayoutContentProps {
    children: React.ReactNode
}

export function LayoutContent({ children }: LayoutContentProps) {
    const isOpen = useSidebarStore((state) => state.isOpen)
    console.log("??????")

    return (
        <div
            className={`flex-1 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'ml-0 lg:ml-[250px] xl:ml-[300px]' : 'ml-0'
                }`}
        >
            {children}
        </div>
    )
}

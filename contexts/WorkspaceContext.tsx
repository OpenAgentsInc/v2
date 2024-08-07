"use client"

import React, { createContext, useState, useContext } from 'react'

interface WorkspaceContextType {
    isWorkspaceOpen: boolean
    toggleWorkspace: () => void
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false)

    const toggleWorkspace = () => setIsWorkspaceOpen(prev => !prev)

    return (
        <WorkspaceContext.Provider value={{ isWorkspaceOpen, toggleWorkspace }}>
            {children}
        </WorkspaceContext.Provider>
    )
}

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext)
    if (context === undefined) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider')
    }
    return context
}

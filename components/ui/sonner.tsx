"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const toasterContent = (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group font-mono"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                    description: "group-[.toast]:text-muted-foreground",
                    actionButton:
                        "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                    cancelButton:
                        "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                },
            }}
            {...props}
        />
    )

    // Only render in the browser
    if (!isMounted) return null

    return createPortal(toasterContent, document.body)
}

export { Toaster }
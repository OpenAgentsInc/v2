'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'
import { SidebarProvider } from '@/lib/hooks/use-sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

export function Providers({ children, ...props }: ThemeProviderProps) {
    return (
        <ClerkProvider
            appearance={{
                baseTheme: dark,
                variables: {
                    colorBackground: "black",
                    colorText: "white",
                    colorPrimary: "white",
                    colorTextOnPrimaryBackground: "black",
                    colorTextSecondary: "white",
                    colorInputBackground: "black",
                    colorInputText: "white",
                    colorNeutral: "white",
                }
            }}
        >
            <NextThemesProvider {...props}>
                <SidebarProvider>
                    <TooltipProvider>{children}</TooltipProvider>
                </SidebarProvider>
            </NextThemesProvider>
        </ClerkProvider>
    )
}

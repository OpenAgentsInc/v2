'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'
import { SidebarProvider } from '@/lib/hooks/use-sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { AuthStateHandler } from '@/components/AuthStateHandler'
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);
console.log('convex:', convex)

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
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
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <AuthStateHandler>
          <NextThemesProvider {...props}>
            <SidebarProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </SidebarProvider>
          </NextThemesProvider>
        </AuthStateHandler>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}

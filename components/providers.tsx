'use client'

import { ConvexReactClient } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeProviderProps } from "next-themes/dist/types"
import * as React from "react"
import { AuthStateHandler } from "@/components/auth/AuthStateHandler"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ClerkProvider, useAuth } from "@clerk/nextjs"
import { dark } from "@clerk/themes"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

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
            <TooltipProvider>{children}</TooltipProvider>
          </NextThemesProvider>
        </AuthStateHandler>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}

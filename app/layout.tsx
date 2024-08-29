import type { Metadata } from "next"
import { jetbrainsMono } from '@/lib/fonts'
import "./globals.css"
import { siteConfig } from "./siteConfig"
import ResetHUDButton from "@/components/ResetHUDButton"
import { ClerkProvider, useAuth } from "@clerk/nextjs"

export const metadata: Metadata = {
  metadataBase: new URL("https://openagents.com"),
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: ["AI", "Developer", "Chatbot"],
  creator: "OpenAgentsInc",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@OpenAgentsInc",
  },
  icons: {
    icon: "/favicon.ico",
  },
}

function AuthenticatedResetHUDButton() {
  const { isSignedIn } = useAuth()
  return <ResetHUDButton isSignedIn={isSignedIn || false} />
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className="dark">
        <body
          className={`${jetbrainsMono.variable} min-h-screen scroll-auto antialiased selection:bg-white selection:text-black dark:bg-black font-mono`}
        >
          <div className="fixed top-4 right-4 z-50">
            <AuthenticatedResetHUDButton />
          </div>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
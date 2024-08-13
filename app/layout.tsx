import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { jetbrainsMono } from '@/lib/fonts'
import "./globals.css"
import { siteConfig } from "./siteConfig"

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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning className="dark">
            <body
                className={`${jetbrainsMono.variable} min-h-screen scroll-auto antialiased selection:bg-white selection:text-black dark:bg-black`}
            >
                <ThemeProvider defaultTheme="dark" attribute="class">
                    {children}
                </ThemeProvider>
            </body>
        </html>
    )
}


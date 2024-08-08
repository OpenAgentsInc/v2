import dynamic from 'next/dynamic'
import { jetbrainsMono } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import '@/app/globals.css'
import { Providers } from '@/components/providers'
import { initializeDatabase } from '@/lib/init-db'

const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false })

export const metadata = {
    metadataBase: process.env.VERCEL_URL
        ? new URL(`https://${process.env.VERCEL_URL}`)
        : undefined,
    title: {
        default: 'OpenAgents',
        template: `%s - OpenAgents`
    },
    description: 'Your AI productivity dashboard',
    icons: {
        icon: '/favicon.ico',
        // shortcut: '/favicon-16x16.png',
        // apple: '/apple-touch-icon.png'
    }
}

export const viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: 'white' },
        { media: '(prefers-color-scheme: dark)', color: 'black' }
    ]
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    // await initializeDatabase();

    return (
        <html lang='en' className='antialiased' suppressHydrationWarning>
            {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
        */}
            <head />
            <body
                className={cn(
                    'font-mono w-screen h-screen bg-black fixed',
                    jetbrainsMono.variable
                )}
            >
                <Providers
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Scene
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            pointerEvents: 'none',
                            zIndex: 0,
                        }}
                    />
                    {children}
                </Providers>
            </body>
        </html>
    )
}

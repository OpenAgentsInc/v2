import dynamic from 'next/dynamic'
import { jetbrainsMono } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import '@/app/globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
            <html lang='en' className='antialiased'>
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
                </body>
            </html>
        </ClerkProvider>
    )
}


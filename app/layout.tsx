import { Layout } from '@/components/dom/Layout'
import { jetbrainsMono } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import '@/app/globals.css'

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
        <html lang='en' className='antialiased'>
            {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
        */}
            <head />
            <body
                className={cn(
                    'font-mono fixed w-screen',
                    jetbrainsMono.variable
                )}
            >
                <Layout>{children}</Layout>
            </body>
        </html>
    )
}


import { currentUser } from '@clerk/nextjs/server'
import dynamic from 'next/dynamic'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false })

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  return (
    <div>
      <Toaster position='top-right' />
      <Providers
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {!!user && (
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
        )}
        {children}
      </Providers>
    </div>
  )
}

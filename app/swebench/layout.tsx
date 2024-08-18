import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Toaster position='top-right' />
      <Providers
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </Providers>
    </div>
  )
}

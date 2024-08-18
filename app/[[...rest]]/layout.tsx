import "./globals.css"
import dynamic from "next/dynamic"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/sonner"
import { currentUser } from "@clerk/nextjs/server"

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
    <div className="size-full fixed w-screen">
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

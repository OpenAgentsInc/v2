"use client"
import Link from "next/link"
import React from "react"
import { siteConfig } from "@/app/siteConfig"
import { IconOpenAgents } from "@/components/ui/icons"
import { SignInButton } from "@clerk/nextjs"
import { Button } from "../Button"
import useScroll from "../use-scroll"
import { cx } from "../utils"

export function Navigation() {
  const scrolled = useScroll(15)
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    // Add a timeout to show the navbar after 0.5 seconds
    const timer = setTimeout(() => setShow(true), 500)
    return () => {
      clearTimeout(timer)
    }
  }, [])

  if (!show) return null

  return (
    <header
      className={cx(
        "font-mono fixed inset-x-3 top-4 z-50 mx-auto flex max-w-6xl transform-gpu animate-fade-in justify-center overflow-hidden rounded-xl border border-transparent px-3 py-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1.03)] will-change-transform",
        "h-16",
        scrolled
          ? "backdrop-blur-nav max-w-3xl border-gray-100 bg-white/80 shadow-xl shadow-black/5 dark:border-white/15 dark:bg-black/70"
          : "bg-white/0 dark:bg-gray-950/0",
      )}
    >
      <div className="w-full my-auto">
        <div className="relative flex items-center justify-between">
          <Link href={siteConfig.baseLinks.home} aria-label="Home">
            <div className="flex flex-row items-center gap-2">
              <span className="sr-only">Company logo</span>
              <IconOpenAgents className="h-6 w-6" />
              <h1 className="font-mono text-lg font-bold">OpenAgents</h1>
            </div>
          </Link>
          <SignInButton mode="modal" forceRedirectUrl="/">
            <Button className="h-10 font-semibold">
              Sign in
            </Button>
          </SignInButton>
        </div>
      </div>
    </header>
  )
}

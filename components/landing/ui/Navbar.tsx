"use client"

import React from "react"
import Link from "next/link"
import { SignInButton } from "@clerk/nextjs"
import { RiCloseLine, RiMenuLine } from "@remixicon/react"
import { siteConfig } from "@/app/siteConfig"
import useScroll from "../use-scroll"
import { cx } from "../utils"
import { IconOpenAgents } from "@/components/ui/icons"
import { Button } from "../Button"

export function Navigation() {
  const scrolled = useScroll(15)
  const [open, setOpen] = React.useState(false)
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery: MediaQueryList = window.matchMedia("(min-width: 768px)")
    const handleMediaQueryChange = () => {
      setOpen(false)
    }
    mediaQuery.addEventListener("change", handleMediaQueryChange)
    handleMediaQueryChange()

    // Add a timeout to show the navbar after 1 second
    const timer = setTimeout(() => setShow(true), 500)

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange)
      clearTimeout(timer)
    }
  }, [])

  if (!show) return null

  return (
    <header
      className={cx(
        "font-mono fixed inset-x-3 top-4 z-50 mx-auto flex max-w-6xl transform-gpu animate-fade-in justify-center overflow-hidden rounded-xl border border-transparent px-3 py-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1.03)] will-change-transform",
        open === true ? "h-52" : "h-16",
        scrolled || open === true
          ? "backdrop-blur-nav max-w-3xl border-gray-100 bg-white/80 shadow-xl shadow-black/5 dark:border-white/15 dark:bg-black/70"
          : "bg-white/0 dark:bg-gray-950/0",
      )}
    >
      <div className="w-full md:my-auto">
        <div className="relative flex items-center justify-between">
          <Link href={siteConfig.baseLinks.home} aria-label="Home">
            <div className="flex flex-row items-center gap-2">
              <span className="sr-only">Company logo</span>
              <IconOpenAgents className="h-6 w-6" />
              <h1 className="font-mono text-lg font-bold">OpenAgents</h1>
            </div>
          </Link>
          <SignInButton mode="modal" forceRedirectUrl="/">
            <Button className="hidden h-10 font-semibold md:flex">
              Sign in
            </Button>
          </SignInButton>
          <div className="flex gap-x-2 md:hidden">
            <Button>Sign in</Button>
            <Button
              onClick={() => setOpen(!open)}
              variant="light"
              className="aspect-square p-2"
            >
              {open ? (
                <RiCloseLine aria-hidden="true" className="size-5" />
              ) : (
                <RiMenuLine aria-hidden="true" className="size-5" />
              )}
            </Button>
          </div>
        </div>
        <nav
          className={cx(
            "my-6 flex text-lg ease-in-out will-change-transform md:hidden",
            open ? "" : "hidden",
          )}
        >
          <ul className="space-y-4 font-medium">
            <li onClick={() => setOpen(false)}>
              <Link href={siteConfig.baseLinks.about}>About</Link>
            </li>
            <li onClick={() => setOpen(false)}>
              <Link href={siteConfig.baseLinks.pricing}>Pricing</Link>
            </li>
            <li onClick={() => setOpen(false)}>
              <Link href={siteConfig.baseLinks.changelog}>Changelog</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

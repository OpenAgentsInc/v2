"use client"

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import {
    IconGitHub,
    IconNextChat,
    IconSeparator,
} from '@/components/ui/icons'
import { SidebarMobile } from './sidebar-mobile'
import { SidebarToggle } from './sidebar-toggle'
import { ChatHistory } from './chat-history'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

function UserOrLogin() {
    return (
        <>
            <SignedIn>
                <SidebarMobile>
                    <ChatHistory userId={""} /> {/* You'll need to pass the user ID from Clerk */}
                </SidebarMobile>
                <SidebarToggle />
            </SignedIn>
            <SignedOut>
                <Link href="/new" rel="nofollow">
                    <IconNextChat className="size-6 mr-2 dark:hidden" inverted />
                    <IconNextChat className="hidden size-6 mr-2 dark:block" />
                </Link>
            </SignedOut>
            <div className="flex items-center">
                <IconSeparator className="size-6 text-muted-foreground/50" />
                <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                    <SignInButton mode="modal">
                        <Button variant="link" className="-ml-2">
                            Login
                        </Button>
                    </SignInButton>
                </SignedOut>
            </div>
        </>
    )
}

export function Header() {
    return (
        <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
            <div className="flex items-center">
                <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
                    <UserOrLogin />
                </React.Suspense>
            </div>
            <div className="flex items-center justify-end space-x-2">
                <a
                    target="_blank"
                    href="https://github.com/openagentsinc/v2"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ variant: 'outline' }))}
                >
                    <IconGitHub />
                    <span className="hidden ml-2 md:flex">GitHub</span>
                </a>
            </div>
        </header>
    )
}

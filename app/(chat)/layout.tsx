import { SidebarDesktop } from '@/components/sidebar-desktop'

interface ChatLayoutProps {
    children: React.ReactNode
}

export default async function ChatLayout({ children }: ChatLayoutProps) {
    return (
        <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
            <SidebarDesktop />
            <div className="flex-1 overflow-hidden transition-[padding] duration-300 ease-in-out peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
                {children}
            </div>
        </div>
    )
}

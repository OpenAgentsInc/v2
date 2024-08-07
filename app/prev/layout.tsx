import { SidebarDesktop } from '@/components/sidebar-desktop'
import { Workspace } from '@/components/workspace'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'

interface ChatLayoutProps {
    children: React.ReactNode
}

export default async function ChatLayout({ children }: ChatLayoutProps) {
    return (
        <WorkspaceProvider>
            <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
                <SidebarDesktop />
                <div className="flex flex-1 overflow-hidden">
                    <div className="flex-1 overflow-hidden transition-[padding,width] duration-300 ease-in-out peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px] peer-[[data-workspace-open=true]]:w-3/5">
                        {children}
                    </div>
                    <Workspace />
                </div>
            </div>
        </WorkspaceProvider>
    )
}

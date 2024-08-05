import React from 'react'
import { cn } from '@/lib/utils'
import { Wrench, Github, GitBranch } from 'lucide-react'
import { useRepoStore } from '@/store/repo'
import * as Popover from '@radix-ui/react-popover'

export function FooterText({ className, ...props }: React.ComponentProps<'div'>) {
    const repo = useRepoStore((state) => state.repo)
    const setRepo = useRepoStore((state) => state.setRepo)

    const [repoInput, setRepoInput] = React.useState({
        owner: repo?.owner || '',
        name: repo?.name || '',
        branch: repo?.branch || ''
    })

    const handleRepoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRepoInput({ ...repoInput, [e.target.name]: e.target.value })
    }

    const handleRepoSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setRepo(repoInput)
    }

    return (
        <div
            className={cn(
                'px-2 text-center text-xs leading-normal text-muted-foreground',
                className
            )}
            {...props}
        >
            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                    <button className="bg-black text-white hover:bg-white/10 rounded px-2 py-1 flex items-center space-x-1">
                        <span className="opacity-75 text-xs">Claude 3.5 Sonnet</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                        </svg>
                    </button>
                    <span className="bg-black text-white rounded-full px-2 py-0.5 text-xs flex items-center opacity-75">
                        <Wrench className="mr-1" size={14} />
                        4
                    </span>
                    {repo && (
                        <Popover.Root>
                            <Popover.Trigger asChild>
                                <button className="bg-black text-white rounded px-2 py-0.5 text-xs flex items-center opacity-75 space-x-1">
                                    <Github size={14} />
                                    <span>{repo.owner}/{repo.name}</span>
                                    <GitBranch size={14} />
                                    <span>{repo.branch}</span>
                                </button>
                            </Popover.Trigger>
                            <Popover.Portal>
                                <Popover.Content 
                                    className="bg-black border border-white rounded-lg shadow-lg p-4 z-50" 
                                    style={{ width: '200px' }}
                                    onOpenAutoFocus={(e) => e.preventDefault()}
                                >
                                    <form onSubmit={handleRepoSubmit} className="space-y-2">
                                        <input
                                            type="text"
                                            name="owner"
                                            value={repoInput.owner}
                                            onChange={handleRepoInputChange}
                                            placeholder="Owner"
                                            className="w-full p-2 bg-black text-white border border-white rounded focus:outline-none focus:border-gray-300 text-sm"
                                            autoComplete="off"
                                            autoFocus={false}
                                        />
                                        <input
                                            type="text"
                                            name="name"
                                            value={repoInput.name}
                                            onChange={handleRepoInputChange}
                                            placeholder="Repo name"
                                            className="w-full p-2 bg-black text-white border border-white rounded focus:outline-none focus:border-gray-300 text-sm"
                                            autoComplete="off"
                                            autoFocus={false}
                                        />
                                        <input
                                            type="text"
                                            name="branch"
                                            value={repoInput.branch}
                                            onChange={handleRepoInputChange}
                                            placeholder="Branch"
                                            className="w-full p-2 bg-black text-white border border-white rounded focus:outline-none focus:border-gray-300 text-sm"
                                            autoComplete="off"
                                            autoFocus={false}
                                        />
                                        <button 
                                            type="submit" 
                                            className="w-full p-2 bg-black text-white border border-white rounded hover:bg-white hover:bg-opacity-5 focus:outline-none text-sm transition-colors duration-200"
                                        >
                                            {repo ? 'Update Repo' : 'Set Repo'}
                                        </button>
                                    </form>
                                </Popover.Content>
                            </Popover.Portal>
                        </Popover.Root>
                    )}
                </div>
            </div>
        </div>
    )
}
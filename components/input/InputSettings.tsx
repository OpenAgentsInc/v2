import { GitBranch, Github, Wrench } from "lucide-react"
import React, { useEffect, useState } from "react"
import AddCreditsForm from "@/components/credits/AddCreditsForm"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import { isGitHubUser } from "@/lib/github/isGitHubUser"
import { models } from "@/lib/models"
import { cn } from "@/lib/utils"
import { useBalanceStore } from "@/store/balance"
import { useModelStore } from "@/store/models"
import { useRepoStore } from "@/store/repo"
import { useToolStore } from "@/store/tools"
import { Model } from "@/types"
import { useUser } from "@clerk/nextjs"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import * as Popover from "@radix-ui/react-popover"

export function InputSettings({ className, ...props }: React.ComponentProps<'div'>) {
  const repo = useRepoStore((state) => state.repo)
  const setRepo = useRepoStore((state) => state.setRepo)
  const model = useModelStore((state) => state.model)
  const setModel = useModelStore((state) => state.setModel)
  const tools = useToolStore((state) => state.tools)
  const setTools = useToolStore((state) => state.setTools)
  const balance = useBalanceStore((state) => state.balance)
  const { user, isLoaded, isSignedIn } = useUser()
  const [isGitHubConnected, setIsGitHubConnected] = useState(false)
  const [showGitHubConnectDialog, setShowGitHubConnectDialog] = useState(false)
  const repo = useRepoStore((state) => state.repo)
  const setRepo = useRepoStore((state) => state.setRepo)
  const model = useModelStore((state) => state.model)
  const setModel = useModelStore((state) => state.setModel)
  const tools = useToolStore((state) => state.tools)
  const setTools = useToolStore((state) => state.setTools)
  const balance = useBalanceStore((state) => state.balance)
  const { user, isLoaded, isSignedIn } = useUser()
  const [isGitHubConnected, setIsGitHubConnected] = useState(false)
  const [showGitHubConnectDialog, setShowGitHubConnectDialog] = useState(false)

  const [repoInput, setRepoInput] = React.useState({
    owner: repo?.owner || '',
    name: repo?.name || '',
    branch: repo?.branch || ''
  })
  const [repoInput, setRepoInput] = React.useState({
    owner: repo?.owner || '',
    name: repo?.name || '',
    branch: repo?.branch || ''
  })

  const [open, setOpen] = React.useState(false)
  const [toolsOpen, setToolsOpen] = React.useState(false)
  const [creditsDialogOpen, setCreditsDialogOpen] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [toolsOpen, setToolsOpen] = React.useState(false)
  const [creditsDialogOpen, setCreditsDialogOpen] = React.useState(false)

  useEffect(() => {
    async function checkGitHubConnection() {
      if (isLoaded && isSignedIn) {
        const isGitHub = await isGitHubUser()
        setIsGitHubConnected(isGitHub)
      }
    }
    checkGitHubConnection()
  }, [isLoaded, isSignedIn])
  useEffect(() => {
    async function checkGitHubConnection() {
      if (isLoaded && isSignedIn) {
        const isGitHub = await isGitHubUser()
        setIsGitHubConnected(isGitHub)
      }
    }
    checkGitHubConnection()
  }, [isLoaded, isSignedIn])

  const handleRepoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepoInput({ ...repoInput, [e.target.name]: e.target.value })
  }
  const handleRepoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepoInput({ ...repoInput, [e.target.name]: e.target.value })
  }

  const handleRepoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setRepo(repoInput)
    setOpen(false)
  }
  const handleRepoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setRepo(repoInput)
    setOpen(false)
  }

  const handleToolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    if (checked) {
      setTools([...tools, name])
    } else {
      setTools(tools.filter((tool) => tool !== name))
    }
  }
  const handleToolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    if (checked) {
      setTools([...tools, name])
    } else {
      setTools(tools.filter((tool) => tool !== name))
    }
  }

  const ourtools = [
    'create_file',
    'list_repos',
    'rewrite_file',
    'scrape_webpage',
    'view_file',
    'view_hierarchy',
    'create_pull_request',
    'create_branch',
    'search_codebase'
  ]
  const ourtools = [
    'create_file',
    'list_repos',
    'rewrite_file',
    'scrape_webpage',
    'view_file',
    'view_hierarchy',
    'create_pull_request',
    'create_branch',
    'search_codebase'
  ]

  const buttonClasses = "opacity-75 bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground rounded px-2 py-1 flex items-center space-x-1 focus:outline-none focus:ring-0 transition-colors duration-200"
  const buttonClasses = "opacity-75 bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground rounded px-2 py-1 flex items-center space-x-1 focus:outline-none focus:ring-0 transition-colors duration-200"

  const isModelDisabled = (modelId: string) => {
    return balance <= 0 && modelId !== 'gpt-4o-mini'
  }
  const isModelDisabled = (modelId: string) => {
    return balance <= 0 && modelId !== 'gpt-4o-mini'
  }

  const handleModelClick = (m: Model) => {
    if (isModelDisabled(m.id)) {
      setCreditsDialogOpen(true)
    } else {
      setModel(m)
    }
  }
  const handleModelClick = (m: Model) => {
    if (isModelDisabled(m.id)) {
      setCreditsDialogOpen(true)
    } else {
      setModel(m)
    }
  }

  const handleGitHubIconClick = () => {
    if (isGitHubConnected) {
      setOpen(true)
    } else {
      setShowGitHubConnectDialog(true)
    }
  }
  const handleGitHubIconClick = () => {
    if (isGitHubConnected) {
      setOpen(true)
    } else {
      setShowGitHubConnectDialog(true)
    }
  }

  if (!isLoaded || !isSignedIn) {
    return null
  }
  if (!isLoaded || !isSignedIn) {
    return null
  }

  return (
    <div
      className={cn(
        'px-2 text-center text-xs leading-normal text-muted-foreground',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className={buttonClasses}>
                <span className="text-xs">{model.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                </svg>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="bg-background border border-input rounded-lg shadow-lg p-1 z-[9999] focus:outline-none">
                {models.map((m) => (
                  <DropdownMenu.Item
                    key={m.id}
                    className={cn(
                      "px-2 py-1 text-foreground hover:bg-accent/80 hover:text-accent-foreground cursor-pointer focus:outline-none focus:bg-accent/80 focus:text-accent-foreground",
                      isModelDisabled(m.id) && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => handleModelClick(m)}
                  >
                    {m.name}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <Popover.Root open={toolsOpen} onOpenChange={setToolsOpen}>
            <Popover.Trigger asChild>
              <button className={buttonClasses}>
                <Wrench className="mr-1" size={14} />
                {tools.length}
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="bg-background border border-input rounded-lg shadow-lg p-4 z-[9999] focus:outline-none"
                style={{ width: '200px' }}
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <form className="space-y-2">
                  {ourtools.map((tool) => (
                    <div key={tool} className="flex items-center">
                      <input
                        type="checkbox"
                        id={tool}
                        name={tool}
                        checked={tools.includes(tool)}
                        onChange={handleToolChange}
                        className="mr-2"
                      />
                      <label htmlFor={tool} className="text-foreground text-sm">
                        {tool}
                      </label>
                    </div>
                  ))}
                </form>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
              <button className={buttonClasses} onClick={handleGitHubIconClick}>
                <Github size={14} />
                {repo ? (
                  <>
                    <span>{repo.owner}/{repo.name}</span>
                    <GitBranch size={14} />
                    <span>{repo.branch}</span>
                  </>
                ) : (
                  <span>Select repo</span>
                )}
              </button>
            </Popover.Trigger>
            {isGitHubConnected && (
              <Popover.Portal>
                <Popover.Content
                  className="bg-background border border-input rounded-lg shadow-lg p-4 z-[9999] focus:outline-none"
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
                      className="w-full p-2 bg-background text-foreground border border-input rounded focus:outline-none focus:border-ring text-sm"
                      autoComplete="off"
                      autoFocus={false}
                    />
                    <input
                      type="text"
                      name="name"
                      value={repoInput.name}
                      onChange={handleRepoInputChange}
                      placeholder="Repo name"
                      className="w-full p-2 bg-background text-foreground border border-input rounded focus:outline-none focus:border-ring text-sm"
                      autoComplete="off"
                      autoFocus={false}
                    />
                    <input
                      type="text"
                      name="branch"
                      value={repoInput.branch}
                      onChange={handleRepoInputChange}
                      placeholder="Branch"
                      className="w-full p-2 bg-background text-foreground border border-input rounded focus:outline-none focus:border-ring text-sm"
                      autoComplete="off"
                      autoFocus={false}
                    />
                    <button
                      type="submit"
                      className="w-full p-2 bg-background text-foreground border border-input rounded hover:bg-accent/80 hover:text-accent-foreground focus:outline-none text-sm transition-colors duration-200"
                    >
                      {repo ? 'Update Repo' : 'Set Repo'}
                    </button>
                  </form>
                </Popover.Content>
              </Popover.Portal>
            )}
          </Popover.Root>
        </div>
      </div>
      <Dialog open={creditsDialogOpen} onOpenChange={setCreditsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Credits</DialogTitle>
            s                     <DialogDescription>
              Advanced models require credits. Select the amount of credits to buy. Min $5, max $1000
            </DialogDescription>
          </DialogHeader>
          <AddCreditsForm uiMode="hosted" clerkUserId={user.id} />
        </DialogContent>
      </Dialog>
      <Dialog open={showGitHubConnectDialog} onOpenChange={setShowGitHubConnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect GitHub Account</DialogTitle>
            <DialogDescription>
              To use the repo selector, you need to connect your GitHub account. Click your profile picture top left, click Manage account, then click connect GitHub.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
  return (
    <div
      className={cn(
        'px-2 text-center text-xs leading-normal text-muted-foreground',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className={buttonClasses}>
                <span className="text-xs">{model.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                </svg>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="bg-background border border-input rounded-lg shadow-lg p-1 z-[9999] focus:outline-none">
                {models.map((m) => (
                  <DropdownMenu.Item
                    key={m.id}
                    className={cn(
                      "px-2 py-1 text-foreground hover:bg-accent/80 hover:text-accent-foreground cursor-pointer focus:outline-none focus:bg-accent/80 focus:text-accent-foreground",
                      isModelDisabled(m.id) && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => handleModelClick(m)}
                  >
                    {m.name}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <Popover.Root open={toolsOpen} onOpenChange={setToolsOpen}>
            <Popover.Trigger asChild>
              <button className={buttonClasses}>
                <Wrench className="mr-1" size={14} />
                {tools.length}
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="bg-background border border-input rounded-lg shadow-lg p-4 z-[9999] focus:outline-none"
                style={{ width: '200px' }}
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <form className="space-y-2">
                  {ourtools.map((tool) => (
                    <div key={tool} className="flex items-center">
                      <input
                        type="checkbox"
                        id={tool}
                        name={tool}
                        checked={tools.includes(tool)}
                        onChange={handleToolChange}
                        className="mr-2"
                      />
                      <label htmlFor={tool} className="text-foreground text-sm">
                        {tool}
                      </label>
                    </div>
                  ))}
                </form>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
              <button className={buttonClasses} onClick={handleGitHubIconClick}>
                <Github size={14} />
                {repo ? (
                  <>
                    <span>{repo.owner}/{repo.name}</span>
                    <GitBranch size={14} />
                    <span>{repo.branch}</span>
                  </>
                ) : (
                  <span>Select repo</span>
                )}
              </button>
            </Popover.Trigger>
            {isGitHubConnected && (
              <Popover.Portal>
                <Popover.Content
                  className="bg-background border border-input rounded-lg shadow-lg p-4 z-[9999] focus:outline-none"
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
                      className="w-full p-2 bg-background text-foreground border border-input rounded focus:outline-none focus:border-ring text-sm"
                      autoComplete="off"
                      autoFocus={false}
                    />
                    <input
                      type="text"
                      name="name"
                      value={repoInput.name}
                      onChange={handleRepoInputChange}
                      placeholder="Repo name"
                      className="w-full p-2 bg-background text-foreground border border-input rounded focus:outline-none focus:border-ring text-sm"
                      autoComplete="off"
                      autoFocus={false}
                    />
                    <input
                      type="text"
                      name="branch"
                      value={repoInput.branch}
                      onChange={handleRepoInputChange}
                      placeholder="Branch"
                      className="w-full p-2 bg-background text-foreground border border-input rounded focus:outline-none focus:border-ring text-sm"
                      autoComplete="off"
                      autoFocus={false}
                    />
                    <button
                      type="submit"
                      className="w-full p-2 bg-background text-foreground border border-input rounded hover:bg-accent/80 hover:text-accent-foreground focus:outline-none text-sm transition-colors duration-200"
                    >
                      {repo ? 'Update Repo' : 'Set Repo'}
                    </button>
                  </form>
                </Popover.Content>
              </Popover.Portal>
            )}
          </Popover.Root>
        </div>
      </div>
      <Dialog open={creditsDialogOpen} onOpenChange={setCreditsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Credits</DialogTitle>
            s                     <DialogDescription>
              Advanced models require credits. Select the amount of credits to buy. Min $5, max $200
            </DialogDescription>
          </DialogHeader>
          <AddCreditsForm uiMode="hosted" clerkUserId={user.id} />
        </DialogContent>
      </Dialog>
      <Dialog open={showGitHubConnectDialog} onOpenChange={setShowGitHubConnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect GitHub Account</DialogTitle>
            <DialogDescription>
              To use the repo selector, you need to connect your GitHub account. Click your profile picture top left, click Manage account, then click connect GitHub.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

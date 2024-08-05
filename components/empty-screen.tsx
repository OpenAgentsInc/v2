export function EmptyScreen() {
    return (
        <div className="mx-auto max-w-2xl px-4">
            <div className="flex flex-col gap-4 rounded-lg border bg-background p-8">
                <h1 className="text-lg font-semibold">
                    Welcome to OpenAgents!
                </h1>
                <p className="leading-normal text-muted-foreground">
                    Your all-in-one AI productivity dashboard can:
                </p>
                <ul className="list-disc space-y-2 text-muted-foreground pl-6">
                    <li className="leading-normal pl-2">View links</li>
                    <li className="leading-normal pl-2">Search the web</li>
                    <li className="leading-normal pl-2">Work with a GitHub repo</li>
                </ul>
            </div>
        </div>
    )
}

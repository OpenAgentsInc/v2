export function EmptyScreen() {
    return (
        <div className="mx-auto max-w-2xl px-4 py-12">
            <div className="flex flex-col gap-4 rounded-lg border bg-background p-8">
                <h1 className="text-lg font-semibold">
                    Welcome to OpenAgents!
                </h1>
                <p className="leading-normal text-muted-foreground">
                    Your all-in-one AI productivity dashboard can:
                </p>
                <ul className="list-disc space-y-2 text-muted-foreground pl-6">
                    <li className="leading-normal pl-2">Chat about anything using top AI models</li>
                    <li className="leading-normal pl-2">Write code in a GitHub repo</li>
                    <li className="leading-normal pl-2">Create pull requests</li>
                    <li className="leading-normal pl-2">Visit links</li>
                    <li className="leading-normal pl-2">Get smarter over time</li>
                </ul>
            </div>
        </div>
    )
}

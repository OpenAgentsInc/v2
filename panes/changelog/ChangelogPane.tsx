import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

const ChangelogPane: React.FC = () => {
  return (
    <Card className="w-full h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardContent>
        <ScrollArea className="py-4 h-[calc(100%-2rem)] pr-4">
          <h2 className="mb-2 font-semibold">Oct 24</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li className="text-sm text-foreground/80">Added ability to manually specify GitHub token</li>
          </ul>
          <h2 className="mb-2 font-semibold">Aug 29</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li className="text-sm text-foreground/80">Added tool to create GitHub issue</li>
            <li className="text-sm text-foreground/80">Added tool to delete file</li>
            <li className="text-sm text-foreground/80">Reordered tools, removed list-repo tool</li>
            <li className="text-sm text-foreground/80">Will warn instead of fail if a needed tool is unchecked</li>
          </ul>
          <h2 className="mt-4 my-2 font-semibold">Aug 27</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li className="text-sm text-foreground/80">Added new GitHub tools for issues & pull requests</li>
            <li className="text-sm text-foreground/80">Added stop button during chat stream (hover over loadspinner)</li>
            <li className="text-sm text-foreground/80">Fixed issue of tool calls not showing on refresh, breaking chats (new chats only)</li>
            <li className="text-sm text-foreground/80">Added button to reset HUD panes to default</li>
            <li className="text-sm text-foreground/80">Nicer commit messages when editing files</li>
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChangelogPane;

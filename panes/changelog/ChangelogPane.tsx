import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

const ChangelogPane: React.FC = () => {
  return (
    <Card className="w-full h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardContent>
        <ScrollArea className="py-4 h-[calc(100%-2rem)] pr-4">
          <h2 className="mb-2 font-semibold">Aug 18</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li className="text-sm text-foreground/80">Max input characters raised from 3500 to 9000</li>
            <li className="text-sm text-foreground/80">Fixed duplicate chats</li>
            <li className="text-sm text-foreground/80">Chats can be shared</li>
          </ul>
          <p className="mt-3 text-sm text-foreground/80">Note: Because we switched databases, any chats older than Aug 18 will not show until later today. Balances will be updated at the same time. For now enjoy the extra credits!</p>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChangelogPane;

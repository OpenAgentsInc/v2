import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const ChangelogPane: React.FC = () => {
  return (
    <Card className="w-full h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader>
        <CardTitle>Changelog</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100%-2rem)] pr-4">
          {/* Add your changelog content here */}
          <p>Recent updates and changes will be displayed here.</p>
          {/* You can map through an array of changelog items if you have them */}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChangelogPane;
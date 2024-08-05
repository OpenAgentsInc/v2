import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';

interface FileViewerProps {
  content: string;
  filename: string;
}

export function FileViewer({ content, filename }: FileViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const previewLines = content.split('\n').slice(0, 5).join('\n');

  return (
    <div className="border rounded p-4">
      <h3 className="text-lg font-semibold mb-2">{filename}</h3>
      <pre className="bg-gray-100 p-2 rounded mb-4">
        <code>{previewLines}</code>
      </pre>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">View Full File</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[80vw] max-h-[80vh] overflow-auto">
          <h2 className="text-xl font-bold mb-4">{filename}</h2>
          <pre className="bg-gray-100 p-4 rounded">
            <code>{content}</code>
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
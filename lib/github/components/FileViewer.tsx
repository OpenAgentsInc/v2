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
    <div className="border rounded p-4 max-w-full">
      <h3 className="text-lg font-semibold mb-2 break-all">{filename}</h3>
      <pre className="bg-gray-100 p-2 rounded mb-4 overflow-x-auto max-w-full">
        <code className="whitespace-pre-wrap break-words">{previewLines}</code>
      </pre>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">View Full File</Button>
        </DialogTrigger>
        <DialogContent className="w-11/12 max-w-4xl max-h-[80vh] overflow-hidden">
          <div className="overflow-y-auto h-full">
            <h2 className="text-xl font-bold mb-4 break-all">{filename}</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto max-w-full">
              <code className="whitespace-pre-wrap break-words">{content}</code>
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GitHubTokenInput } from '@/components/GitHubTokenInput';
import { Github } from 'lucide-react';

export const GitHubTokenDialog: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="fixed bottom-4 left-20 z-50">
          <Github className="h-4 w-4" />
          <span className="sr-only">Set GitHub Token</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set GitHub Token</DialogTitle>
          <DialogDescription>
            If you have a GitHub account connected, we'll use your GitHub token from that. You can also manually specify one here.
          </DialogDescription>
        </DialogHeader>
        <GitHubTokenInput />
      </DialogContent>
    </Dialog>
  );
};
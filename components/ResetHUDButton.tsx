"use client";

import React from 'react';
import { usePaneStore } from '@/store/pane';
import { Button } from '@/components/ui/button';
import { IconRefresh } from '@/components/ui/icons';
import { useAuth } from '@clerk/nextjs';

const ResetHUDButton: React.FC = () => {
  const resetHUDState = usePaneStore((state) => state.resetHUDState);
  const { isSignedIn } = useAuth();

  const handleReset = () => {
    resetHUDState();
  };

  if (!isSignedIn) {
    return null;
  }

  return (
    <Button
      onClick={handleReset}
      variant="outline"
      size="icon"
      className="fixed bottom-4 left-4 z-50"
    >
      <IconRefresh className="h-4 w-4" />
      <span className="sr-only">Reset HUD</span>
    </Button>
  );
};

export default ResetHUDButton;
import React from 'react';
import { usePaneStore } from '@/store/pane';
import { Button } from '@/components/ui/button';

export function HUDControls() {
  const resetHUDState = usePaneStore((state) => state.resetHUDState);

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button onClick={resetHUDState} variant="outline" size="sm">
        Reset HUD
      </Button>
    </div>
  );
}
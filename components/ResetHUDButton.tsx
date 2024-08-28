"use client";

import React from 'react';
import { usePaneStore } from '@/store/pane';

const ResetHUDButton: React.FC = () => {
  const resetHUDState = usePaneStore((state) => state.resetHUDState);

  const handleReset = () => {
    resetHUDState();
  };

  return (
    <button
      onClick={handleReset}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      Reset HUD
    </button>
  );
};

export default ResetHUDButton;
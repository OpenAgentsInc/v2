import { useState } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { ChatCoreType } from './types';

export const useChatCore = (): ChatCoreType => {
  const [threadId, setThreadId] = useState<string | null>(null);
  const queryClient = new QueryClient();

  return {
    threadId,
    setThreadId,
    queryClient,
  };
};
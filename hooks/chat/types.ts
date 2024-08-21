import { QueryClient } from '@tanstack/react-query';

export interface ThreadMetadata {
  title?: string;
  lastMessagePreview?: string;
}

export interface Thread {
  id: string;
  metadata?: ThreadMetadata;
  createdAt?: string;
  userId: string;
  shareToken?: string;
}

export interface Message {
  id: string;
  threadId: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
  toolInvocations?: Record<string, any>;
}

export interface ChatCoreType {
  threadId: string | null;
  setThreadId: (id: string | null) => void;
  queryClient: QueryClient;
}

export interface ChatMessagesType {
  messages: Message[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export interface ChatThreadType {
  threadId: string | null;
  setThreadId: (id: string | null) => void;
  threadData: Thread | null;
  setThreadData: (data: Thread | null) => void;
  updateTitle: (newTitle: string) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export interface ChatMutationsType {
  sendMessage: (message: string) => Promise<void>;
}

export interface ChatType extends ChatCoreType, ChatMessagesType, ChatThreadType, ChatMutationsType {}
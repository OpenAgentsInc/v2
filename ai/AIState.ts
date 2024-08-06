import { ReactNode } from 'react';

export interface AIState {
  chatId: string;
  messages: Message[];
  metadata: ChatMetadata;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  createdAt: number;
}

export interface ChatMetadata {
  createdAt: number;
  userId: string;
  path: string;
}

export interface Chat extends AIState {
  id: string;
  title: string;
  createdAt: Date;
  path: string;
}

export interface Tool {
  description: string;
  parameters: any;
  generate: (...args: any[]) => AsyncGenerator<ReactNode, ReactNode, unknown>;
}

export interface AIStateManager {
  get: () => AIState;
  update: (newState: Partial<AIState>) => void;
  done: (finalState: Partial<AIState>) => void;
}
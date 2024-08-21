import { Id } from '../../convex/_generated/dataModel';

export interface ThreadMetadata {
  title?: string;
  lastMessagePreview?: string;
}

export interface Thread {
  _id: Id<"threads">;
  metadata?: ThreadMetadata;
  createdAt?: string;
  clerk_user_id: string;
  user_id: Id<"users">;
  _creationTime: number;
  shareToken?: string;
}

export interface Message {
  id: string;
  threadId: Id<"threads">;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
  toolInvocations?: Record<string, any>;
}

export interface ChatCoreType {
  threadId: Id<"threads"> | null;
  setThreadId: (id: Id<"threads"> | null) => void;
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  updateTitle: (newTitle: string) => Promise<void>;
}
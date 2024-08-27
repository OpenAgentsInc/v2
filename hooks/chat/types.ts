import { Id } from '../../convex/_generated/dataModel'

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
  content: string;
  role: 'user' | 'assistant';
  createdAt: number;
  tool_invocations?: any; // Consider creating a more specific type
}
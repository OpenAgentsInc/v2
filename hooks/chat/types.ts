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
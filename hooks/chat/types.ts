import { Id } from '../../convex/_generated/dataModel'

export interface ThreadMetadata {
  title?: string;
  lastMessagePreview?: string;
}

export interface Thread {
  _id: Id<"threads">;
  metadata?: ThreadMetadata;
  messages: any[];
  createdAt?: Date;
}

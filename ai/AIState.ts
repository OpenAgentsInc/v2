import { ReactNode } from 'react';

/**
 * AIState represents the serializable state of the AI application.
 * This state is used on the server and can be shared with the language model.
 * It serves as the source of truth for the current application state.
 */
export interface AIState {
  /**
   * An array of messages representing the conversation history between the user and the assistant.
   */
  messages: Message[];

  /**
   * A unique identifier for the current chat session.
   */
  chatId: string;

  /**
   * Additional metadata about the chat session, such as creation time or user information.
   */
  metadata: ChatMetadata;
}

/**
 * Represents a single message in the conversation history.
 */
export interface Message {
  /**
   * A unique identifier for the message.
   */
  id: string;

  /**
   * The role of the entity that sent the message.
   * - 'user': Message from the human user
   * - 'assistant': Message from the AI assistant
   * - 'system': System message (e.g., instructions or context)
   * - 'function': Message from a function call (used for tool interactions)
   */
  role: 'user' | 'assistant' | 'system' | 'function';

  /**
   * The content of the message. This can be plain text or a serialized representation of more complex data.
   */
  content: string;

  /**
   * Timestamp indicating when the message was created.
   */
  createdAt: number;
}

/**
 * Additional metadata associated with the chat session.
 */
export interface ChatMetadata {
  /**
   * Timestamp indicating when the chat session was created.
   */
  createdAt: number;

  /**
   * Identifier of the user who initiated the chat session.
   */
  userId: string;

  /**
   * The URL path associated with this chat session.
   */
  path: string;
}

/**
 * Represents a tool that can be used by the AI model.
 */
export interface Tool {
  /**
   * A description of what the tool does and when it should be used.
   */
  description: string;

  /**
   * The parameters required by the tool, defined using Zod schema.
   */
  parameters: any; // In practice, this would be a Zod schema

  /**
   * An asynchronous generator function that executes the tool's functionality.
   * It can yield intermediate results (e.g., loading states) and return a final React component.
   */
  generate: (...args: any[]) => AsyncGenerator<ReactNode, ReactNode, unknown>;
}

/**
 * Functions for managing AI State
 */
export interface AIStateManager {
  /**
   * Retrieves the current AI state.
   */
  get: () => AIState;

  /**
   * Updates the AI state with new data.
   * @param newState - The new state to be merged with the current state.
   */
  update: (newState: Partial<AIState>) => void;

  /**
   * Marks the current state as final and triggers any necessary side effects (e.g., saving to a database).
   * @param finalState - The final state to be set before completing the operation.
   */
  done: (finalState: Partial<AIState>) => void;
}

// Note: The actual implementation of these types and interfaces would be more complex,
// potentially including additional properties and methods as needed for the specific application.
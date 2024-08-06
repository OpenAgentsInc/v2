import { ReactNode } from 'react';

/**
 * UIState represents the visual state of the AI application on the client side.
 * It contains React elements and other data that can be rendered in the UI.
 * Unlike AIState, UIState is not serializable and is only used on the client.
 */
export interface UIState {
  /**
   * An array of UI messages representing the conversation history as it appears in the UI.
   */
  messages: UIMessage[];

  /**
   * The current UI state of the chat input (e.g., loading, error, ready).
   */
  inputState: 'idle' | 'loading' | 'error';

  /**
   * Any error message that should be displayed in the UI.
   */
  errorMessage?: string;
}

/**
 * Represents a single message in the UI, which can contain React elements.
 */
export interface UIMessage {
  /**
   * A unique identifier for the UI message.
   */
  id: string;

  /**
   * The role of the entity that sent the message.
   */
  role: 'user' | 'assistant' | 'system' | 'function';

  /**
   * The content of the message as a React Node, allowing for rich UI representations.
   */
  display: ReactNode;

  /**
   * Timestamp indicating when the message was created.
   */
  createdAt: number;
}

/**
 * Represents a UI component that can be dynamically rendered by the AI.
 */
export interface UIComponent {
  /**
   * The type of the component (e.g., 'button', 'input', 'select').
   */
  type: string;

  /**
   * Props to be passed to the component when rendering.
   */
  props: Record<string, any>;

  /**
   * Child elements of the component, if any.
   */
  children?: UIComponent[] | string;
}

/**
 * Functions for managing UI State
 */
export interface UIStateManager {
  /**
   * Retrieves the current UI state.
   */
  get: () => UIState;

  /**
   * Updates the UI state with new data.
   * @param newState - The new state to be merged with the current state.
   */
  set: (newState: Partial<UIState>) => void;

  /**
   * Adds a new message to the UI state.
   * @param message - The new message to be added.
   */
  addMessage: (message: UIMessage) => void;

  /**
   * Updates the input state in the UI.
   * @param state - The new input state.
   */
  setInputState: (state: UIState['inputState']) => void;

  /**
   * Sets an error message in the UI state.
   * @param message - The error message to be displayed.
   */
  setError: (message: string) => void;
}

/**
 * A hook for accessing and updating the UI state in functional components.
 * @returns A tuple containing the current UI state and a function to update it.
 */
export type UseUIState = () => [UIState, (newState: Partial<UIState>) => void];

// Note: The actual implementation of these types and interfaces would be more complex,
// potentially including additional properties and methods as needed for the specific application.
// The UseUIState hook, for example, would be implemented using React's useState or a custom hook.
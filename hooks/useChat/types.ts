export interface Message {
    /**
     * A unique identifier for the message.
     */
    id: string;

    /**
     * The timestamp of the message.
     */
    createdAt?: Date;

    /**
     * Text content of the message.
     */
    content: string;
}

export interface UseChatProps {
    /**
     * A unique identifier for the chat. If not provided, a random one will be
    * generated. When provided, the `useChat` hook with the same `id` will
    * have shared states across components.
    */
    id?: string;
}

/**
 * Represents the number of tokens used in a prompt and completion.
 */
export type CompletionTokenUsage = {
    /**
     * The number of tokens used in the prompt.
     */
    promptTokens: number;

    /**
     * The number of tokens used in the completion.
     */
    completionTokens: number;

    /**
     * The total number of tokens used (promptTokens + completionTokens).
     */
    totalTokens: number;
};

/**
 * Represents the number of tokens used in an embedding.
 */
export type EmbeddingTokenUsage = {
    /**
     * The number of tokens used in the embedding.
     */
    tokens: number;
};

/**
 * Calculates the completion token usage based on prompt and completion tokens.
 * 
 * @param usage An object containing promptTokens and completionTokens.
 * @returns A CompletionTokenUsage object with calculated totalTokens.
 */
export function calculateCompletionTokenUsage(usage: {
    promptTokens: number;
    completionTokens: number;
}): CompletionTokenUsage {
    return {
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.promptTokens + usage.completionTokens,
    };
}

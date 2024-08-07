import { tool, CoreTool } from 'ai';
import { z } from 'zod';
import axios from 'axios';
import { ToolContext } from '@/types';

const params = z.object({
    query: z.string().describe("The search query string"),
    repositories: z.array(z.object({
        remote: z.string().describe("The remote URL of the repository"),
        branch: z.string().describe("The branch to search in"),
        repository: z.string().describe("The name of the repository")
    })).describe("The repositories to search in"),
    sessionId: z.string().optional().describe("A unique session ID for the search")
});

type Params = z.infer<typeof params>;

type Result = {
    success: boolean;
    data?: Array<{
        repository: string;
        remote: string;
        branch: string;
        filepath: string;
        linestart: number;
        lineend: number;
        summary: string;
    }>;
    error?: string;
    summary: string;
    details: string;
};

export const searchCodebaseTool = (context: ToolContext): CoreTool<typeof params, Result> => tool({
    name: 'search_codebase',
    description: 'Searches the codebase using the Greptile API',
    parameters: params,
    execute: async ({ query, repositories, sessionId }: Params): Promise<Result> => {
        if (!context.gitHubToken) {
            return {
                success: false,
                error: "Missing GitHub token",
                summary: "Failed to search codebase due to missing GitHub token",
                details: "The tool context is missing the required GitHub token."
            };
        }

        const greptileToken = process.env.GREPTILE_API_KEY;
        if (!greptileToken) {
            return {
                success: false,
                error: "Missing Greptile API key",
                summary: "Failed to search codebase due to missing Greptile API key",
                details: "The GREPTILE_API_KEY environment variable is not set."
            };
        }

        try {
            const response = await axios.post('https://api.greptile.com/v2/search', {
                query,
                repositories,
                sessionId,
                stream: false
            }, {
                headers: {
                    'Authorization': `Bearer ${greptileToken}`,
                    'X-GitHub-Token': context.gitHubToken,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                return {
                    success: true,
                    data: response.data,
                    summary: 'Successfully searched codebase',
                    details: `Found ${response.data.length} results for query: ${query}`
                };
            } else {
                throw new Error('Search failed');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: errorMessage,
                summary: 'Failed to search codebase',
                details: `An error occurred while trying to search the codebase: ${errorMessage}`
            };
        }
    },
});
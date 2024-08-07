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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const searchCodebaseTool = (context: ToolContext): CoreTool<typeof params, Result> => tool({
    name: 'search_codebase',
    description: 'Searches the codebase using the Greptile API',
    parameters: params,
    execute: async ({ query, repositories, sessionId }: Params): Promise<Result> => {
        if (!context.greptileToken) {
            return {
                success: false,
                error: "Missing Greptile API key",
                summary: "Failed to search codebase due to missing Greptile API key",
                details: "The GREPTILE_API_KEY environment variable is not set."
            };
        }

        if (!context.gitHubToken) {
            return {
                success: false,
                error: "Missing GitHub token",
                summary: "Failed to search codebase due to missing GitHub token",
                details: "The tool context is missing the required GitHub token."
            };
        }

        const headers = {
            'Authorization': `Bearer ${context.greptileToken}`,
            'X-GitHub-Token': context.gitHubToken,
            'Content-Type': 'application/json'
        };

        for (const repo of repositories) {
            try {
                // Check if the repository is indexed
                const checkResponse = await axios.get(`https://api.greptile.com/v2/repositories/${repo.repository}`, { headers });
                
                if (checkResponse.data.status !== 'ready') {
                    // Repository is not indexed, start indexing
                    const indexResponse = await axios.post('https://api.greptile.com/v2/repositories', {
                        remote: repo.remote,
                        repository: repo.repository,
                        branch: repo.branch,
                        reload: true,
                        notify: false
                    }, { headers });

                    if (indexResponse.data.response.includes("Processing started")) {
                        // Wait for indexing to complete (max 5 minutes)
                        for (let i = 0; i < 30; i++) {
                            await delay(10000); // Wait for 10 seconds
                            const statusResponse = await axios.get(`https://api.greptile.com/v2/repositories/${repo.repository}`, { headers });
                            if (statusResponse.data.status === 'ready') {
                                break;
                            }
                            if (i === 29) {
                                return {
                                    success: false,
                                    error: "Indexing timeout",
                                    summary: `Indexing of ${repo.repository} timed out after 5 minutes`,
                                    details: "The repository indexing process took too long. Please try again later."
                                };
                            }
                        }
                    } else {
                        return {
                            success: false,
                            error: "Indexing failed",
                            summary: `Failed to start indexing for ${repo.repository}`,
                            details: indexResponse.data.response
                        };
                    }
                }
            } catch (error) {
                return {
                    success: false,
                    error: "Repository check/indexing failed",
                    summary: `Failed to check or index repository ${repo.repository}`,
                    details: error instanceof Error ? error.message : String(error)
                };
            }
        }

        try {
            const response = await axios.post('https://api.greptile.com/v2/search', {
                query,
                repositories,
                sessionId,
                stream: false
            }, { headers });

            return {
                success: true,
                data: response.data,
                summary: 'Successfully searched codebase',
                details: `Found ${response.data.length} results for query: ${query}`
            };
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
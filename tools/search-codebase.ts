import { tool, CoreTool } from 'ai';
import { z } from 'zod';
import axios, { AxiosError } from 'axios';
import { ToolContext } from '@/types';

const params = z.object({
    query: z.string().describe("The natural-language search query string"),
    repositories: z.array(z.object({
        remote: z.string().describe("The remote URL of the repository"),
        branch: z.string().describe("The branch to search in"),
        repository: z.string().describe("The name of the repository in owner/repo format")
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
                const repositoryId = `github:${repo.branch}:${repo.repository}`;
                console.log(`Checking indexing status for repository: ${repositoryId}`);

                let needsIndexing = false;
                try {
                    const checkResponse = await axios.get(`https://api.greptile.com/v2/repositories/${repositoryId}`, { headers });
                    console.log(`Indexing status response:`, checkResponse.data);
                    if (checkResponse.data.status !== 'ready') {
                        needsIndexing = true;
                    }
                } catch (error) {
                    if (axios.isAxiosError(error) && error.response?.status === 404) {
                        console.log(`Repository ${repo.repository} not found. Starting indexing process.`);
                        needsIndexing = true;
                    } else {
                        throw error;
                    }
                }

                if (needsIndexing) {
                    console.log(`Repository ${repo.repository} needs indexing. Starting indexing process.`);
                    try {
                        const indexResponse = await axios.post('https://api.greptile.com/v2/repositories', {
                            remote: 'github',
                            repository: repo.repository,
                            branch: repo.branch,
                            reload: true,
                            notify: false
                        }, { headers });
                        console.log(`Indexing response:`, indexResponse.data);

                        if (indexResponse.data.response.includes("started repo processing")) {
                            console.log(`Indexing started for ${repo.repository}. Waiting for completion...`);
                            for (let i = 0; i < 30; i++) {
                                await delay(10000);
                                const statusResponse = await axios.get(`https://api.greptile.com/v2/repositories/${repositoryId}`, { headers });
                                console.log(`Indexing status check ${i + 1}:`, statusResponse.data);
                                if (statusResponse.data.status === 'ready') {
                                    console.log(`Indexing completed for ${repo.repository}`);
                                    break;
                                }
                                if (i === 29) {
                                    console.log(`Indexing of ${repo.repository} is still in progress after 5 minutes. Proceeding with search anyway.`);
                                    break;
                                }
                            }
                        } else if (indexResponse.data.response.includes("repo already exists")) {
                            console.log(`Repository ${repo.repository} is already indexed. Proceeding with search.`);
                        } else {
                            console.log(`Unexpected indexing response for ${repo.repository}. Proceeding with search anyway.`);
                        }
                    } catch (indexError) {
                        console.error(`Error during indexing for ${repo.repository}:`, indexError);
                        console.log(`Proceeding with search despite indexing error for ${repo.repository}.`);
                    }
                } else {
                    console.log(`Repository ${repo.repository} is already indexed.`);
                }
            } catch (error) {
                console.error(`Error checking/indexing repository ${repo.repository}:`, error);
                console.log(`Proceeding with search despite error for ${repo.repository}.`);
            }
        }

        try {
            console.log(`Performing search with query: "${query}"`);
            const response = await axios.post('https://api.greptile.com/v2/search', {
                query,
                repositories: repositories.map(repo => ({
                    remote: 'github',
                    repository: repo.repository,
                    branch: repo.branch
                })),
                sessionId,
                stream: false
            }, { headers });
            console.log(`Search response:`, response.data);

            return {
                success: true,
                data: response.data,
                summary: 'Successfully searched codebase',
                details: `Found ${response.data.length} results for query: ${query}`
            };
        } catch (error) {
            const axiosError = error as AxiosError;
            return {
                success: false,
                error: "Search failed",
                summary: 'Failed to search codebase',
                details: `Error: ${axiosError.message}. Status: ${axiosError.response?.status}. Data: ${JSON.stringify(axiosError.response?.data)}`
            };
        }
    },
});
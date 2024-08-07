import { tool, CoreTool } from 'ai';
import { z } from 'zod';
import axios from 'axios';
import { ToolContext } from '@/types';

const params = z.object({
    url: z.string().url().describe("The URL of the webpage to scrape"),
    pageOptions: z.object({
        onlyMainContent: z.boolean().optional().describe("Whether to extract only the main content of the page")
    }).optional().describe("Options for page processing")
});

type Params = z.infer<typeof params>;

type Result = {
    success: boolean;
    data?: {
        content: string;
        markdown: string;
        provider: string;
        metadata: {
            title: string;
            description: string;
            language: string | null;
            sourceURL: string;
        };
    };
    error?: string;
    summary: string;
    details: string;
};

export const scrapeWebpageTool = (context: ToolContext): CoreTool<typeof params, Result> => tool({
    name: 'scrape_webpage',
    description: 'Scrapes a webpage using Firecrawl and returns the content in markdown format',
    parameters: params,
    execute: async ({ url, pageOptions }: Params): Promise<Result> => {
        if (!context.firecrawlToken) {
            return {
                success: false,
                error: "Missing Firecrawl token",
                summary: "Failed to scrape webpage due to missing Firecrawl token",
                details: "The tool context is missing the required Firecrawl token."
            };
        }

        try {
            const response = await axios.post('https://api.firecrawl.dev/v0/scrape', {
                url,
                pageOptions
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${context.firecrawlToken}`
                }
            });

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    summary: 'Successfully scraped webpage',
                    details: `Scraped content from ${url}`
                };
            } else {
                throw new Error('Scraping failed');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: errorMessage,
                summary: 'Failed to scrape webpage',
                details: `An error occurred while trying to scrape ${url}: ${errorMessage}`
            };
        }
    },
});

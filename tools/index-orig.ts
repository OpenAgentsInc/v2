import { CoreTool } from 'ai';
import { z } from 'zod';

const ACTIVE_TOOLS = [
    'rewrite_file',
    'view_hierarchy',
    'view_file',
    'create_file',
    'list_repos',
    'scrape_webpage',
] as const;

type ToolName = typeof ACTIVE_TOOLS[number];

interface RepoContext {
    owner: string;
    name: string;
    branch: string;
}

const toolDefinitions: Record<ToolName, () => Promise<CoreTool<any, any>>> = {
    rewrite_file: () => import('./rewrite-file').then(m => m.rewriteFileTool),
    view_hierarchy: () => import('./view-hierarchy').then(m => m.viewHierarchyTool),
    view_file: () => import('./view-file').then(m => m.viewFileTool),
    create_file: () => import('./create-file').then(m => m.createFileTool),
    list_repos: () => import('./list-repos').then(m => m.listReposTool),
    scrape_webpage: () => import('./scrape-webpage').then(m => m.scrapeWebpageTool),
};

export function getTools(githubToken: string, firecrawlToken: string, repoContext: RepoContext): Record<ToolName, Promise<CoreTool<any, any>>> {
    return Object.fromEntries(
        ACTIVE_TOOLS.map(toolName => [
            toolName,
            toolDefinitions[toolName]().then(tool => ({
                ...tool,
                schema: z.object(tool.parameters.properties),
                execute: async (params: any) => {
                    try {
                        if (tool.execute) {
                            if (toolName === 'scrape_webpage') {
                                return await tool.execute({
                                    ...params,
                                    firecrawlToken,
                                    repoContext
                                });
                            } else {
                                return await tool.execute({
                                    ...params,
                                    token: githubToken,
                                    repoContext
                                });
                            }
                        } else {
                            throw new Error(`Tool ${toolName} has no execute function`);
                        }
                    } catch (error) {
                        throw error;
                    }
                },
            }))
        ])
    ) as Record<ToolName, Promise<CoreTool<any, any>>>;
}

export async function resolveTools(toolPromises: Record<string, Promise<CoreTool<any, any>>>): Promise<Record<string, CoreTool<any, any>>> {
    const resolvedTools: Record<string, CoreTool<any, any>> = {};
    for (const [name, promise] of Object.entries(toolPromises)) {
        try {
            resolvedTools[name] = await promise;
        } catch (error) {
            throw new Error(`Failed to resolve tool ${name}: ${error}`);
        }
    }
    return resolvedTools;
}

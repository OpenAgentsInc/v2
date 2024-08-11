export interface ToolContext {
    user: any // User | null;
    repo: any //Repo | null;
    gitHubToken: string | undefined;
    firecrawlToken: string | undefined;
    greptileToken: string | undefined;
    model: any; // LanguageModelV1(?)
}
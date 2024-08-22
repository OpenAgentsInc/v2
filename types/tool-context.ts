import { Repo } from "./repo"

export interface ToolContext {
  repo: Repo | null;
  githubToken: string | undefined;
  firecrawlToken: string | undefined;
  greptileToken: string | undefined;
  model: any; // LanguageModelV1(?)
}

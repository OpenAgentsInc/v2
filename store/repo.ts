import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Repo {
    owner: string;
    name: string;
    branch: string;
}

interface RepoState {
    repo: Repo | null;
    setRepo: (repo: Repo | null) => void;
    githubToken: string | null;
    setGithubToken: (token: string | null) => void;
}

export const useRepoStore = create<RepoState>()(
    persist(
        (set) => ({
            repo: null,
            setRepo: (repo) => set({ repo }),
            githubToken: null,
            setGithubToken: (token) => set({ githubToken: token }),
        }),
        {
            name: 'openagents-repo-storage-11',
            partialize: (state) => ({ repo: state.repo, githubToken: state.githubToken }),
        }
    )
)
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
}

export const useRepoStore = create<RepoState>()(
    persist(
        (set) => ({
            repo: {
                owner: 'bitcoin',
                name: 'bitcoin',
                branch: 'master',
            },
            setRepo: (repo) => set({ repo }),
        }),
        {
            name: 'openagents-repo-storage-5',
            partialize: (state) => ({ repo: state.repo }),
        }
    )
)


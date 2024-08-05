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
                owner: 'openagentsinc',
                name: 'v2',
                branch: 'main',
            },
            setRepo: (repo) => set({ repo }),
        }),
        {
            name: 'openagents-repo-storage-2',
            partialize: (state) => ({ repo: state.repo }),
        }
    )
)


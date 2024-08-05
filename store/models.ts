import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { models } from '@/lib/models'

interface Model {
    name: string;
    id: string;
    provider: string;
}

interface ModelState {
    model: Model;
    setModel: (model: Model) => void;
}

export const useModelStore = create<ModelState>()(
    persist(
        (set) => ({
            model: models[0], // Default to the first model
            setModel: (model) => set({ model }),
        }),
        {
            name: 'openagents-model-storage-1',
            partialize: (state) => ({ model: state.model }),
        }
    )
)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { models } from '@/lib/models'
import { Model } from '@/types'

interface ModelState {
    model: Model;
    setModel: (model: Model) => void;
}

export const useModelStore = create<ModelState>()(
    persist(
        (set) => ({
            // Default to the cheapest model, which is the last in the array
            model: models[models.length - 1],
            setModel: (model) => set({ model }),
        }),
        {
            name: 'openagents-model-storage-2',
            partialize: (state) => ({ model: state.model }),
        }
    )
)

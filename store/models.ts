import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { models } from '@/lib/models'
import { Model } from '@/types'
import { useBalanceStore } from '@/store/balance'

interface ModelState {
    model: Model;
    setModel: (model: Model) => void;
}

export const useModelStore = create<ModelState>()(
    persist(
        (set) => {
            const balanceStore = useBalanceStore.getState();
            const updateModel = (balance: number) => {
                if (balance <= 0) {
                    set({ model: models.find(m => m.id === 'gpt-4o-mini') });
                }
            };

            // Subscribe to balance changes
            const unsubscribe = useBalanceStore.subscribe((state) => {
                updateModel(state.balance);
            });

            // Default to the cheapest model, which is the last in the array
            const initialModel = models[models.length - 1];
            return {
                model: initialModel,
                setModel: (model) => set({ model }),
            };
        },
        {
            name: 'openagents-model-storage-2',
            partialize: (state) => ({ model: state.model }),
        }
    )
)
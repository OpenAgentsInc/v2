import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BalanceState {
    balance: number;
    setBalance: (balance: number) => void;
}

export const useBalanceStore = create<BalanceState>()(
    persist(
        (set) => ({
            balance: 0,
            setBalance: (balance) => set({ balance }),
        }),
        {
            name: 'openagents-user-balance-storage-2',
            partialize: (state) => ({ balance: state.balance }),
        }
    )
);

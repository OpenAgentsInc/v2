import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ToolState {
    tools: string[];
    setTools: (tools: string[]) => void;
}

export const useToolStore = create<ToolState>()(
    persist(
        (set) => ({
            tools: [],
            setTools: (tools) => set({ tools }),
        }),
        {
            name: 'openagents-tools-storage',
            partialize: (state) => ({ tools: state.tools }),
        }
    )
);

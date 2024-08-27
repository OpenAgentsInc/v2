import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ToolState {
    tools: string[];
    setTools: (tools: string[]) => void;
    getSelectedTools: () => string[];
}

export const useToolStore = create<ToolState>()(
    persist(
        (set, get) => ({
            tools: [],
            setTools: (tools) => set({ tools }),
            getSelectedTools: () => get().tools,
        }),
        {
            name: 'openagents-tools-storage',
            partialize: (state) => ({ tools: state.tools }),
        }
    )
);
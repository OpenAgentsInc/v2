import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Thread {
    id: string;
    metadata: any;
    createdAt: string;
}

interface User {
    id: string;
    clerk_user_id: string;
    // Add other user properties as needed
}

interface UserState {
    user: User | null;
    threads: Thread[];
    setUser: (user: User | null) => void;
    setThreads: (threads: Thread[]) => void;
    addThread: (thread: Thread) => void;
    removeThread: (threadId: string) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            threads: [],
            setUser: (user) => set({ user }),
            setThreads: (threads) => set({ threads }),
            addThread: (thread) => set((state) => ({
                threads: [thread, ...state.threads]
            })),
            removeThread: (threadId) => set((state) => ({
                threads: state.threads.filter(t => t.id !== threadId)
            })),
        }),
        {
            name: 'openagents-user-storage-1',
            partialize: (state) => ({
                user: state.user,
                threads: state.threads
            }),
        }
    )
)


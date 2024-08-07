import { useQuery } from 'react-query';
import { getUserData, getUserThreads } from '@/lib/db/queries';
import { useUserStore } from '@/lib/store/userStore';

export function useUserData(userId: string) {
    const { setUser, setThreads } = useUserStore();

    const { isLoading, error } = useQuery(['userData', userId], async () => {
        const userData = await getUserData(userId);
        const userThreads = await getUserThreads(userId);

        setUser(userData);
        setThreads(userThreads);

        return { userData, userThreads };
    });

    return { isLoading, error };
}

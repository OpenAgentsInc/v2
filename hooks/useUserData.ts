import { useQuery } from 'react-query';
import { getUserData, getUserThreads } from '@/db/queries';
import { useUserStore } from '@/lib/store/userStore';
import { useUser } from "@clerk/nextjs";

export function useUserData() {
    const { user, isLoaded, isSignedIn } = useUser();
    const { setUser, setThreads } = useUserStore();

    const { isLoading, error } = useQuery(
        ['userData', user?.id],
        async () => {
            if (!isSignedIn || !user?.id) {
                throw new Error("User is not signed in");
            }
            const userData = await getUserData(user.id);
            const userThreads = await getUserThreads(user.id);
            console.log('User Data:', userData);
            console.log('User Threads:', userThreads);
            setUser(userData);
            setThreads(userThreads);
            return { userData, userThreads };
        },
        {
            enabled: isLoaded && isSignedIn,
        }
    );

    return { isLoading: isLoading || !isLoaded, error };
}
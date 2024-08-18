import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

export function useEnsureUser() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isUserEnsured, setIsUserEnsured] = useState(false);
  const createOrGetUser = useMutation(api.threads.createOrGetUser.createOrGetUser);

  useEffect(() => {
    if (isUserLoaded && user) {
      createOrGetUser({
        clerk_user_id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        image: user.imageUrl,
      })
        .then(() => {
          setIsUserEnsured(true);
        })
        .catch((error) => {
          console.error('Error ensuring user:', error);
        });
    }
  }, [isUserLoaded, user, createOrGetUser]);

  return {
    isUserEnsured,
    isLoading: !isUserLoaded || (isUserLoaded && user && !isUserEnsured),
    user,
  };
}
